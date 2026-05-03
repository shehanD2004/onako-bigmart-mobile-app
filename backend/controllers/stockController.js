const StockEntry = require('../models/StockEntry');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.lowStock === 'true') {
      // Will be handled after population
    }
    const result = await paginate(StockEntry, filter, req, 'product,warehouse');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getByProduct = async (req, res, next) => {
  try {
    const entries = await StockEntry.find({ product: req.params.productId }).populate('warehouse');
    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};

exports.getByWarehouse = async (req, res, next) => {
  try {
    const entries = await StockEntry.find({ warehouse: req.params.warehouseId }).populate('product');
    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const entry = await StockEntry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const entry = await StockEntry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entry) throw new AppError('Stock entry not found', 404);
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await StockEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stock entry removed' });
  } catch (err) { next(err); }
};
