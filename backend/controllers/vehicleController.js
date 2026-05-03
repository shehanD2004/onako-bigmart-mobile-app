const Vehicle = require('../models/Vehicle');
const { getAll, getOne, createOne, updateOne } = require('./factory');
exports.getAll = getAll(Vehicle);
exports.getOne = getOne(Vehicle);
exports.create = createOne(Vehicle);
exports.update = updateOne(Vehicle);
exports.remove = async (req, res, next) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, { status: 'retired', isActive: false });
    res.json({ success: true, message: 'Vehicle retired' });
  } catch (err) { next(err); }
};
