const Vehicle = require('../models/Vehicle');
const { getAll, getOne, createOne, updateOne } = require('./factory');
exports.getAll = getAll(Vehicle);
exports.getOne = getOne(Vehicle);
exports.create = async (req, res, next) => {
  try {
    req.body.registrationNumber = req.body.registrationNumber || req.body.plateNumber || ('VEH-' + Date.now());
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
};
exports.update = updateOne(Vehicle);
exports.remove = async (req, res, next) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, { status: 'retired', isActive: false });
    res.json({ success: true, message: 'Vehicle retired' });
  } catch (err) { next(err); }
};
