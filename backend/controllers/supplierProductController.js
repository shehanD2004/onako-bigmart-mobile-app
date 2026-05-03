const SupplierProduct = require('../models/SupplierProduct');
const Supplier = require('../models/Supplier');
const { AppError } = require('../middleware/errorHandler');
const { selectBestSupplier } = require('../utils/supplierSelection');

// Get all products linked to a supplier
exports.getBySupplier = async (req, res, next) => {
  try {
    const data = await SupplierProduct.find({ supplier: req.params.supplierId }).populate('product');
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
};

// Get all suppliers linked to a product
exports.getByProduct = async (req, res, next) => {
  try {
    const data = await SupplierProduct.find({ product: req.params.productId }).populate('supplier');
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
};

// Upsert supplier-product mapping (race-safe)
exports.create = async (req, res, next) => {
  try {
    const { supplier, product, unitCost, leadTimeDays, minOrderQty, isActive, ...otherFields } = req.body;

    // Validation
    if (!supplier || !product) throw new AppError('Supplier and Product are required', 400);
    if (unitCost === undefined || unitCost <= 0) throw new AppError('unitCost must be greater than 0', 400);
    if (leadTimeDays !== undefined && leadTimeDays < 0) throw new AppError('leadTimeDays must be >= 0', 400);
    if (minOrderQty !== undefined && minOrderQty < 1) throw new AppError('minOrderQty must be >= 1', 400);

    // Verify supplier is active
    const sup = await Supplier.findById(supplier);
    if (!sup) throw new AppError('Supplier not found', 404);
    if (!sup.isActive) throw new AppError('Cannot map products to inactive supplier', 400);

    // Atomic upsert
    const doc = await SupplierProduct.findOneAndUpdate(
      { supplier, product },
      { $set: { unitCost, leadTimeDays, minOrderQty, isActive, ...otherFields } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Update mapping
exports.update = async (req, res, next) => {
  try {
    const { unitCost, leadTimeDays, minOrderQty } = req.body;
    if (unitCost !== undefined && unitCost <= 0) throw new AppError('unitCost must be > 0', 400);
    if (leadTimeDays !== undefined && leadTimeDays < 0) throw new AppError('leadTimeDays must be >= 0', 400);
    if (minOrderQty !== undefined && minOrderQty < 1) throw new AppError('minOrderQty must be >= 1', 400);

    const doc = await SupplierProduct.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) throw new AppError('Mapping not found', 404);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Remove mapping
exports.remove = async (req, res, next) => {
  try {
    await SupplierProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Unlinked' });
  } catch (err) { next(err); }
};

// Get best supplier for a product using scoring algorithm
exports.getBestSupplier = async (req, res, next) => {
  try {
    const mappings = await SupplierProduct.find({ product: req.params.productId }).populate('supplier');
    const best = selectBestSupplier(mappings);
    if (!best) {
      return res.json({ success: true, data: null, message: 'No active suppliers found for this product' });
    }
    res.json({ success: true, data: best });
  } catch (err) { next(err); }
};
