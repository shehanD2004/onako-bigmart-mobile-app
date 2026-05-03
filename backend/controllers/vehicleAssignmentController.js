const VehicleAssignment = require('../models/VehicleAssignment');
const { paginate, getOne, createOne, updateOne, deleteOne } = require('./factory');
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.staff) filter.staff = req.query.staff;
    if (req.query.date) filter.date = new Date(req.query.date);
    if (req.query.status) filter.status = req.query.status;
    const result = await paginate(VehicleAssignment, filter, req, 'vehicle,staff,createdBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
exports.getToday = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const data = await VehicleAssignment.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('vehicle staff');
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
exports.getOne = getOne(VehicleAssignment, 'vehicle,staff,createdBy');
exports.create = async (req, res, next) => {
  try { req.body.createdBy = req.user._id; const d = await VehicleAssignment.create(req.body); res.status(201).json({ success: true, data: d }); } catch(e){next(e);}
};
exports.update = updateOne(VehicleAssignment);
exports.remove = deleteOne(VehicleAssignment);
