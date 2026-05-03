const StockMovement = require('../models/StockMovement');
const StockEntry = require('../models/StockEntry');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const result = await paginate(StockMovement, filter, req, 'product,warehouse,performedBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const mov = await StockMovement.findById(req.params.id).populate('product warehouse performedBy');
    if (!mov) throw new AppError('Movement not found', 404);
    res.json({ success: true, data: mov });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { product, warehouse, type, quantityChange, notes } = req.body;
    // Find or create stock entry
    let stock = await StockEntry.findOne({ product, warehouse });
    if (!stock) stock = await StockEntry.create({ product, warehouse, quantity: 0 });

    const quantityBefore = stock.quantity;
    stock.quantity = Math.max(0, stock.quantity + quantityChange);
    await stock.save();

    const movement = await StockMovement.create({
      product, warehouse, type, quantityChange,
      quantityBefore, quantityAfter: stock.quantity,
      notes, performedBy: req.user._id,
      referenceType: req.body.referenceType || 'Manual',
      referenceId: req.body.referenceId,
    });
    res.status(201).json({ success: true, data: movement });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const mov = await StockMovement.findByIdAndUpdate(req.params.id, { notes: req.body.notes }, { new: true });
    if (!mov) throw new AppError('Movement not found', 404);
    res.json({ success: true, data: mov });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await StockMovement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Movement deleted' });
  } catch (err) { next(err); }
};
