const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const StockEntry = require('../models/StockEntry');
const StockMovement = require('../models/StockMovement');
const SupplierProduct = require('../models/SupplierProduct');
const Product = require('../models/Product');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');
const { selectBestSupplier } = require('../utils/supplierSelection');
const { PO_TRANSITIONS, validateTransition } = require('../utils/stateMachines');

// ─── LIST ALL POs ───
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.supplier) filter.supplier = req.query.supplier;
    if (req.query.status) {
      if (req.query.status.includes(',')) {
        filter.status = { $in: req.query.status.split(',').map(s => s.trim()) };
      } else {
        filter.status = req.query.status;
      }
    }
    if (req.query.search) {
      filter.$or = [
        { poNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const result = await paginate(PurchaseOrder, filter, req, 'supplier,warehouse,createdBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// ─── GET ONE PO ───
exports.getOne = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('warehouse')
      .populate('items.product')
      .populate('createdBy', 'name email');
    if (!po) throw new AppError('Purchase Order not found', 404);
    res.json({ success: true, data: po });
  } catch (err) { next(err); }
};

// ─── CREATE PO ───
exports.create = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;

    // Validate required fields
    if (!req.body.supplier) throw new AppError('Supplier is required', 400);
    if (!req.body.warehouse) throw new AppError('Warehouse is required', 400);
    if (!req.body.items || req.body.items.length === 0) {
      throw new AppError('Purchase order must have at least one item', 400);
    }

    const Supplier = require('../models/Supplier');
    const supplierDoc = await Supplier.findById(req.body.supplier);
    if(supplierDoc) {
       if (supplierDoc.performanceScore < 30 && !req.body.overrideGuardrail) {
           return next(new AppError('Supplier score is critically low (<30). PO creation blocked.', 403));
       }
       if (supplierDoc.performanceScore < 40 && !req.body.manualApproval && !req.body.overrideGuardrail) {
           return next(new AppError('Supplier score is poor (<40). Manual approval flag required.', 403));
       }
       if (supplierDoc.performanceScore < 60) {
           req.body.notes = (req.body.notes ? req.body.notes + ' | ' : '') + 'WARNING: Supplier score is below 60. Proceed with caution.';
       }
    }

    const productIds = req.body.items.map(i => i.product);
    const existing = await PurchaseOrder.findOne({
      supplier: req.body.supplier,
      status: { $in: ['draft', 'sent', 'acknowledged'] },
      'items.product': { $in: productIds },
    });
    if (existing) {
      return next(new AppError(
        `Open PO #${existing.poNumber} already covers one or more of these products. Update it instead.`,
        400
      ));
    }

    // Calculate pricing
    req.body.items = req.body.items.map(i => ({
      ...i,
      receivedQty: 0,
      total: i.orderedQty * i.unitCost,
    }));
    const subtotal = req.body.items.reduce((s, i) => s + i.total, 0);
    req.body.pricing = {
      subtotal,
      tax: req.body.pricing?.tax || 0,
      shipping: req.body.pricing?.shipping || 0,
      grandTotal: subtotal + (req.body.pricing?.tax || 0) + (req.body.pricing?.shipping || 0),
    };

    const po = await PurchaseOrder.create(req.body);
    const populated = await PurchaseOrder.findById(po._id)
      .populate('supplier')
      .populate('warehouse')
      .populate('items.product')
      .populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// ─── UPDATE PO (DRAFT ONLY) ───
exports.update = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) throw new AppError('Purchase Order not found', 404);
    if (po.status !== 'draft') {
      throw new AppError('Only draft Purchase Orders can be edited', 400);
    }

    // Update allowed fields
    const { supplier, warehouse, items, notes, expectedDeliveryDate, pricing } = req.body;
    if (supplier) po.supplier = supplier;
    if (warehouse) po.warehouse = warehouse;
    if (notes !== undefined) po.notes = notes;
    if (expectedDeliveryDate !== undefined) po.expectedDeliveryDate = expectedDeliveryDate || null;

    if (items && items.length > 0) {
      po.items = items.map(i => ({
        product: i.product,
        sku: i.sku || '',
        description: i.description || '',
        orderedQty: Number(i.orderedQty),
        receivedQty: 0,
        unitCost: Number(i.unitCost),
        total: Number(i.orderedQty) * Number(i.unitCost),
      }));
    }

    // Recalculate pricing
    const subtotal = po.items.reduce((s, i) => s + (i.orderedQty * i.unitCost), 0);
    po.pricing = {
      subtotal,
      tax: pricing?.tax ?? po.pricing?.tax ?? 0,
      shipping: pricing?.shipping ?? po.pricing?.shipping ?? 0,
      grandTotal: subtotal + (pricing?.tax ?? po.pricing?.tax ?? 0) + (pricing?.shipping ?? po.pricing?.shipping ?? 0),
    };

    await po.save();

    const updated = await PurchaseOrder.findById(po._id)
      .populate('supplier')
      .populate('warehouse')
      .populate('items.product')
      .populate('createdBy', 'name email');
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── CANCEL PO ───
exports.remove = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) throw new AppError('Purchase Order not found', 404);
    if (['received', 'closed'].includes(po.status)) {
      throw new AppError('Cannot cancel a received or closed PO', 400);
    }
    po.status = 'cancelled';
    await po.save();
    res.json({ success: true, message: 'PO cancelled' });
  } catch (err) { next(err); }
};

// ─── STATUS UPDATE WITH LIFECYCLE VALIDATION ───
exports.updateStatus = async (req, res, next) => {
  try {
    const { status: newStatus, note, receivedItems } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) throw new AppError('Purchase Order not found', 404);

    // Validate transition
    validateTransition(PO_TRANSITIONS, po.status, newStatus, 'PO');

    // Validate warehouse exists for receiving
    if ((newStatus === 'received' || newStatus === 'partially_received') && !po.warehouse) {
      throw new AppError('Cannot receive inventory: no warehouse assigned to this PO', 400);
    }

    // ─── RECEIVING LOGIC ───
    if (newStatus === 'partially_received' || newStatus === 'received') {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // If receivedItems provided, update per-item quantities
        if (receivedItems && Array.isArray(receivedItems) && receivedItems.length > 0) {
          for (const ri of receivedItems) {
            const poItem = po.items.id(ri.itemId);
            if (!poItem) continue;

            const qtyToAdd = Number(ri.receivedQty) || 0;
            if (qtyToAdd <= 0) continue;

            // Don't exceed ordered qty
            const maxAllowed = poItem.orderedQty - poItem.receivedQty;
            const actualQty = Math.min(qtyToAdd, maxAllowed);
            if (actualQty <= 0) continue;

            poItem.receivedQty += actualQty;

            // Update stock
            let stock = await StockEntry.findOne({
              product: poItem.product,
              warehouse: po.warehouse,
            }).session(session);

            if (stock) {
              const before = stock.quantity;
              stock.quantity += actualQty;
              await stock.save({ session });

              await StockMovement.create([{
                product: poItem.product,
                warehouse: po.warehouse,
                type: 'purchase',
                quantityChange: actualQty,
                quantityBefore: before,
                quantityAfter: stock.quantity,
                referenceType: 'PurchaseOrder',
                referenceId: po._id,
                performedBy: req.user._id,
                notes: note || `PO ${po.poNumber} - received ${actualQty} units`,
              }], { session });
            } else {
              // Create new stock entry
              await StockEntry.create([{
                product: poItem.product,
                warehouse: po.warehouse,
                quantity: actualQty,
              }], { session });

              await StockMovement.create([{
                product: poItem.product,
                warehouse: po.warehouse,
                type: 'purchase',
                quantityChange: actualQty,
                quantityBefore: 0,
                quantityAfter: actualQty,
                referenceType: 'PurchaseOrder',
                referenceId: po._id,
                performedBy: req.user._id,
                notes: note || `PO ${po.poNumber} - initial stock from purchase`,
              }], { session });
            }
          }
        } else if (newStatus === 'received') {
          // No receivedItems provided, mark all as fully received
          for (const item of po.items) {
            const remaining = item.orderedQty - (item.receivedQty || 0);
            if (remaining <= 0) continue;

            item.receivedQty = item.orderedQty;

            let stock = await StockEntry.findOne({
              product: item.product,
              warehouse: po.warehouse,
            }).session(session);

            if (stock) {
              const before = stock.quantity;
              stock.quantity += remaining;
              await stock.save({ session });

              await StockMovement.create([{
                product: item.product,
                warehouse: po.warehouse,
                type: 'purchase',
                quantityChange: remaining,
                quantityBefore: before,
                quantityAfter: stock.quantity,
                referenceType: 'PurchaseOrder',
                referenceId: po._id,
                performedBy: req.user._id,
                notes: note || `PO ${po.poNumber} - fully received`,
              }], { session });
            } else {
              await StockEntry.create([{
                product: item.product,
                warehouse: po.warehouse,
                quantity: remaining,
              }], { session });

              await StockMovement.create([{
                product: item.product,
                warehouse: po.warehouse,
                type: 'purchase',
                quantityChange: remaining,
                quantityBefore: 0,
                quantityAfter: remaining,
                referenceType: 'PurchaseOrder',
                referenceId: po._id,
                performedBy: req.user._id,
                notes: note || `PO ${po.poNumber} - initial stock from purchase`,
              }], { session });
            }
          }
        }

        // Auto-determine final status based on received quantities
        const allReceived = po.items.every(i => i.receivedQty >= i.orderedQty);
        const someReceived = po.items.some(i => i.receivedQty > 0);

        if (allReceived) {
          po.status = 'received';
          po.actualDeliveryDate = new Date();
        } else if (someReceived) {
          po.status = 'partially_received';
        } else {
          po.status = newStatus;
        }

        await po.save({ session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } else {
      // Non-receiving status changes (sent, acknowledged, cancelled)
      po.status = newStatus;
      await po.save();
    }

    // Re-populate for response
    const updated = await PurchaseOrder.findById(po._id)
      .populate('supplier')
      .populate('warehouse')
      .populate('items.product')
      .populate('createdBy', 'name email');
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ─── AUTO-GENERATE POs FOR LOW-STOCK ───
exports.autoGenerate = async (req, res, next) => {
  try {
    // Find all stock entries below threshold
    const stockEntries = await StockEntry.find().populate('product warehouse');
    const lowStockItems = stockEntries.filter(se =>
      se.product && se.product.isActive && se.quantity <= (se.product.lowStockThreshold || 10)
    );

    if (lowStockItems.length === 0) {
      return res.json({ success: true, created: 0, message: 'All stock levels are healthy', skippedProducts: [] });
    }

    const skippedProducts = [];
    // Group by best supplier
    const supplierPOMap = {}; // supplierId -> { supplier, warehouse, items[] }

    for (const se of lowStockItems) {
      const productId = se.product._id;

      // Find supplier mappings
      const mappings = await SupplierProduct.find({ product: productId }).populate('supplier');
      const best = selectBestSupplier(mappings);

      if (!best) {
        skippedProducts.push({ productId, name: se.product.name, reason: 'No active supplier mapping' });
        continue;
      }

      const qty = Math.max(se.product.reorderQuantity || 50, best.minOrderQty || 1);
      const supplierId = best.supplier._id.toString();

      if (!supplierPOMap[supplierId]) {
        supplierPOMap[supplierId] = {
          supplier: best.supplier._id,
          warehouse: se.warehouse._id,
          items: [],
        };
      }

      // Check if this product is already in existing draft PO for this supplier
      const existingDraft = await PurchaseOrder.findOne({
        supplier: best.supplier._id,
        status: 'draft',
        'items.product': productId,
      });

      if (existingDraft) continue;

      supplierPOMap[supplierId].items.push({
        product: productId,
        sku: se.product.sku,
        description: se.product.name,
        orderedQty: qty,
        receivedQty: 0,
        unitCost: best.unitCost,
        total: qty * best.unitCost,
      });
    }

    // Create or merge POs
    const createdPOs = [];
    for (const key of Object.keys(supplierPOMap)) {
      const poData = supplierPOMap[key];
      if (poData.items.length === 0) continue;

      let existingDraft = await PurchaseOrder.findOne({
        supplier: poData.supplier,
        status: 'draft',
      });

      if (existingDraft) {
        existingDraft.items.push(...poData.items);
        const subtotal = existingDraft.items.reduce((s, i) => s + (i.orderedQty * i.unitCost), 0);
        existingDraft.pricing.subtotal = subtotal;
        existingDraft.pricing.grandTotal = subtotal + (existingDraft.pricing.tax || 0) + (existingDraft.pricing.shipping || 0);
        await existingDraft.save();
        createdPOs.push(existingDraft);
      } else {
        const subtotal = poData.items.reduce((s, i) => s + i.total, 0);
        const po = await PurchaseOrder.create({
          supplier: poData.supplier,
          warehouse: poData.warehouse,
          items: poData.items,
          pricing: { subtotal, tax: 0, shipping: 0, grandTotal: subtotal },
          status: 'draft',
          createdBy: req.user._id,
        });
        createdPOs.push(po);
      }
    }

    res.json({
      success: true,
      created: createdPOs.length,
      purchaseOrders: createdPOs.map(po => po.poNumber || po._id),
      skippedProducts,
    });
  } catch (err) { next(err); }
};
