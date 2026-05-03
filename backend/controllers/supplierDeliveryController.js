const mongoose = require('mongoose');
const SupplierDelivery = require('../models/SupplierDelivery');
const PurchaseOrder = require('../models/PurchaseOrder');
const StockEntry = require('../models/StockEntry');
const StockMovement = require('../models/StockMovement');
const { paginate, getOne, deleteOne } = require('./factory');
const { AppError } = require('../middleware/errorHandler');
const { DELIVERY_TRANSITIONS, validateTransition } = require('../utils/stateMachines');

// ─── LIST ───
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.supplier) filter.supplier = req.query.supplier;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.purchaseOrder) filter.purchaseOrder = req.query.purchaseOrder;
    const result = await paginate(SupplierDelivery, filter, req, 'purchaseOrder,supplier,warehouse,receivedBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ─── GET ONE ───
exports.getOne = getOne(SupplierDelivery, 'purchaseOrder,supplier,warehouse,deliveredItems.product,receivedBy');

// ─── CREATE DELIVERY (with stock update & PO sync) ───
exports.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { purchaseOrder: poId, deliveredItems = [], status = 'complete' } = req.body;

    if (!poId) throw new AppError('purchaseOrder is required', 400);

    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new AppError('Purchase Order not found', 404);
    if (['cancelled', 'closed'].includes(po.status)) {
      throw new AppError(`Cannot create delivery for a ${po.status} PO`, 400);
    }

    req.body.supplier = req.body.supplier || po.supplier;
    req.body.warehouse = req.body.warehouse || po.warehouse;
    req.body.receivedBy = req.body.receivedBy || req.user?._id;

    // ── Update stock & PO receivedQty for each delivered item ──
    for (const di of deliveredItems) {
      const qty = Number(di.receivedQty) || 0;
      if (qty <= 0 || !di.product) continue;

      // Sync PO item receivedQty
      const poItem = po.items.find(i => i.product?.toString() === di.product?.toString());
      if (poItem) {
        const maxAdd = poItem.orderedQty - poItem.receivedQty;
        const actualQty = Math.min(qty, maxAdd);
        if (actualQty > 0) {
          poItem.receivedQty += actualQty;

          // Update stock
          let stock = await StockEntry.findOne({ product: di.product, warehouse: req.body.warehouse }).session(session);
          if (stock) {
            const before = stock.quantity;
            stock.quantity += actualQty;
            await stock.save({ session });
            await StockMovement.create([{
              product: di.product, warehouse: req.body.warehouse,
              type: 'purchase', quantityChange: actualQty,
              quantityBefore: before, quantityAfter: stock.quantity,
              referenceType: 'SupplierDelivery', referenceId: null, // will update after create
              performedBy: req.user?._id,
              notes: `Delivery for PO ${po.poNumber}`,
            }], { session });
          } else {
            await StockEntry.create([{ product: di.product, warehouse: req.body.warehouse, quantity: actualQty }], { session });
            await StockMovement.create([{
              product: di.product, warehouse: req.body.warehouse,
              type: 'purchase', quantityChange: actualQty,
              quantityBefore: 0, quantityAfter: actualQty,
              referenceType: 'SupplierDelivery', referenceId: null,
              performedBy: req.user?._id,
              notes: `Delivery for PO ${po.poNumber} - initial stock`,
            }], { session });
          }
        }
      }
    }

    // Auto-determine PO status after delivery
    const allReceived = po.items.every(i => i.receivedQty >= i.orderedQty);
    const someReceived = po.items.some(i => i.receivedQty > 0);
    if (allReceived) {
      po.status = 'received';
      po.actualDeliveryDate = new Date();
    } else if (someReceived) {
      po.status = 'partially_received';
    }
    await po.save({ session });

    const delivery = await SupplierDelivery.create([req.body], { session });

    await session.commitTransaction();

    const populated = await SupplierDelivery.findById(delivery[0]._id)
      .populate('purchaseOrder', 'poNumber status')
      .populate('supplier', 'name code')
      .populate('warehouse', 'name code')
      .populate('deliveredItems.product', 'name sku')
      .populate('receivedBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─── UPDATE (transaction-safe receiving) ───
exports.update = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const delivery = await SupplierDelivery.findById(req.params.id).session(session);
    if (!delivery) throw new AppError('Delivery not found', 404);
    
    const po = await PurchaseOrder.findById(delivery.purchaseOrder).session(session);
    if (!po) throw new AppError('PO not found', 404);

    const incomingStatus = req.body.status || 'completed';

    // Validate transition
    validateTransition(DELIVERY_TRANSITIONS, delivery.status, incomingStatus, 'Delivery');

    if (req.body.items && req.body.items.length > 0) {
      for (const item of req.body.items) {
        const poItem = po.items.find(i => i.product.equals(item.product));
        if (!poItem)
          throw new AppError(`Product ${item.product} is not in PO ${po.poNumber}`, 400);

        const alreadyReceived = poItem.receivedQty || 0;
        if (alreadyReceived + item.receivedQty > poItem.orderedQty)
          throw new AppError(
            `Cannot receive ${item.receivedQty} units of product ${item.product} — would exceed ordered qty of ${poItem.orderedQty}`,
            400
          );

        poItem.receivedQty = alreadyReceived + item.receivedQty;

        const stockUpdate = await StockEntry.findOneAndUpdate(
          { product: item.product, warehouse: delivery.warehouse },
          { $inc: { quantity: item.receivedQty } },
          { upsert: true, session, new: true, runValidators: false } // we rely on the pre-save validation or DB constraints
        );
        // Wait, pre-save hook on StockEntry won't fire for findOneAndUpdate. MongoDB driver constraints or manual check is needed.
        if (stockUpdate && stockUpdate.quantity < 0) {
          throw new AppError('Stock quantity cannot go negative', 400);
        }

        await StockMovement.create([{
          product:        item.product,
          warehouse:      delivery.warehouse,
          type:           'purchase',
          quantityChange: item.receivedQty,
          referenceId:    delivery._id,
          referenceType:  'SupplierDelivery',
          performedBy:    req.user ? req.user._id : null,
        }], { session });

        // track it in delivery.deliveredItems too
        const diItem = delivery.deliveredItems.find(di => di.product.equals(item.product));
        if (diItem) {
          diItem.receivedQty += item.receivedQty;
        } else {
          delivery.deliveredItems.push({
            product: item.product,
            receivedQty: item.receivedQty
          });
        }
      }
    }

    const fullyReceived = po.items.every(i => i.receivedQty >= i.orderedQty);
    delivery.status = fullyReceived ? 'completed' : 'partial';
    if (delivery.status === 'completed') delivery.completedAt = new Date();
    po.status = fullyReceived ? 'received' : 'partially_received';

    await delivery.save({ session });
    await po.save({ session });
    await session.commitTransaction();

    res.status(200).json({ status: 'success', data: { delivery, po } });

    // Background hook: Supplier Performance tracking
    if (incomingStatus === 'completed' || incomingStatus === 'complete' || fullyReceived) {
       const procurementService = require('../services/procurementService');
       procurementService.logSupplierPerformance(delivery._id).catch(e => console.error("Performance Log Error:", e));
    }
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─── DELETE ───
exports.remove = deleteOne(SupplierDelivery);
