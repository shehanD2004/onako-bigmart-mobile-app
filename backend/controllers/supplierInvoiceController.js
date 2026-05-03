const SupplierInvoice = require('../models/SupplierInvoice');
const { paginate, getOne, createOne, updateOne, deleteOne } = require('./factory');
const { AppError } = require('../middleware/errorHandler');
const { INVOICE_TRANSITIONS, validateTransition } = require('../utils/stateMachines');

// ─── LIST ───
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.supplier) filter.supplier = req.query.supplier;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.purchaseOrder) filter.purchaseOrder = req.query.purchaseOrder;
    const result = await paginate(SupplierInvoice, filter, req, 'supplier,purchaseOrder');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ─── GET ONE ───
exports.getOne = getOne(SupplierInvoice, 'supplier,purchaseOrder');

// ─── CREATE ───
exports.create = async (req, res, next) => {
  try {
    // Sanitize empty strings to avoid CastError/ValidationError in Mongoose
    if (req.body.purchaseOrder === '') req.body.purchaseOrder = undefined;
    if (req.body.dueDate === '') req.body.dueDate = undefined;

    if (req.body.purchaseOrder) {
      const PurchaseOrder = require('../models/PurchaseOrder');
      const po = await PurchaseOrder.findById(req.body.purchaseOrder);
      if (po) {
        let maxBillable = 0;
        for (const item of po.items) {
          maxBillable += (item.receivedQty || 0) * (item.unitCost || 0);
        }
        if (req.body.totalAmount > maxBillable) {
          return next(new AppError(
            `Invoice total ${req.body.totalAmount} exceeds delivered value of ${maxBillable}`,
            400
          ));
        }
      }
    }
    const doc = await SupplierInvoice.create(req.body);

    const procurementService = require('../services/procurementService');
    try {
      await procurementService.threeWayMatchInvoice(doc._id);
    } catch(e) {
      console.error("Three-way match failed during creation", e);
    }

    // re-fetch after possible status update
    const updated = await SupplierInvoice.findById(doc._id);

    res.status(201).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE ───
exports.update = updateOne(SupplierInvoice);

// ─── UPDATE STATUS ───
// Valid transitions
const VALID_TRANSITIONS = {
  draft:          ['sent', 'voided'],
  sent:           ['overdue', 'partially_paid', 'paid', 'voided'],
  overdue:        ['partially_paid', 'paid', 'voided'],
  partially_paid: ['paid', 'overdue', 'voided'],
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status: newStatus, paymentMethod, paidDate } = req.body;
    const invoice = await SupplierInvoice.findById(req.params.id);
    if (!invoice) throw new AppError('Invoice not found', 404);

    if (newStatus) {
      validateTransition(INVOICE_TRANSITIONS, invoice.status, newStatus, 'Invoice');
      invoice.status = newStatus;
    }

    // Set paidDate when fully paid
    if (newStatus === 'paid') {
      invoice.paidDate = paidDate ? new Date(paidDate) : new Date();
      if (paymentMethod) invoice.paymentMethod = paymentMethod;
    }

    // Mark overdue if past due date
    if (newStatus === 'overdue' && invoice.dueDate && new Date() < new Date(invoice.dueDate)) {
      throw new AppError('Cannot mark as overdue before the due date', 400);
    }

    await invoice.save();

    const updated = await SupplierInvoice.findById(invoice._id)
      .populate('supplier', 'name code')
      .populate('purchaseOrder', 'poNumber status');

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── DELETE ───
exports.remove = deleteOne(SupplierInvoice);

// ─── ADD PAYMENT ───
exports.addPayment = async (req, res, next) => {
  try {
    const invoice = await SupplierInvoice.findById(req.params.id);
    if (!invoice) return next(new AppError('Invoice not found', 404));
    if (invoice.paymentStatus === 'paid')
      return next(new AppError('Invoice is already fully paid', 400));
    if (req.body.amount <= 0)
      return next(new AppError('Payment amount must be positive', 400));
    if (req.body.amount > invoice.remainingBalance)
      return next(new AppError(
        `Payment of ${req.body.amount} exceeds remaining balance of ${invoice.remainingBalance}`,
        400
      ));

    invoice.totalPaid += req.body.amount;
    invoice.payments.push({
      amount:    req.body.amount,
      paidAt:    new Date(),
      method:    req.body.method,
      reference: req.body.reference,
    });
    await invoice.save();
    res.status(200).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};
