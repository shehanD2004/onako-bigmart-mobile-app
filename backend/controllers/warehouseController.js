const Warehouse = require('../models/Warehouse');
const StockEntry = require('../models/StockEntry');
const { getAll, getOne, createOne, updateOne } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = getAll(Warehouse);
exports.getOne = getOne(Warehouse);
exports.create = createOne(Warehouse);
exports.update = updateOne(Warehouse);
exports.remove = async (req, res, next) => {
  try {
    await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Warehouse deactivated' });
  } catch (err) { next(err); }
};
