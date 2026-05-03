const Staff = require('../models/Staff');
const { getAll, getOne, createOne, updateOne } = require('./factory');
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const { paginate } = require('./factory');
    const result = await paginate(Staff, filter, req, 'user');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
exports.getOne = getOne(Staff, 'user');
exports.update = updateOne(Staff);
exports.create = async (req, res, next) => {
  try {
    req.body.employeeId = req.body.employeeId || ('EMP-' + Date.now());
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Staff deactivated' });
  } catch (err) { next(err); }
};
