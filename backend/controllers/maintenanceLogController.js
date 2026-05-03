const MaintenanceLog = require('../models/MaintenanceLog');
const { paginate, getOne, createOne, updateOne, deleteOne } = require('./factory');
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    const result = await paginate(MaintenanceLog, filter, req, 'vehicle,loggedBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
exports.getByVehicle = async (req, res, next) => {
  try {
    const data = await MaintenanceLog.find({ vehicle: req.params.vid }).populate('loggedBy').sort('-createdAt');
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
};
exports.getOne = getOne(MaintenanceLog, 'vehicle,loggedBy');
exports.create = async (req, res, next) => {
  try { req.body.loggedBy = req.user._id; const d = await MaintenanceLog.create(req.body); res.status(201).json({ success: true, data: d }); } catch(e){next(e);}
};
exports.update = updateOne(MaintenanceLog);
exports.remove = deleteOne(MaintenanceLog);
