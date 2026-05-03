const DeliveryTrip = require('../models/DeliveryTrip');
const { paginate, getOne, updateOne, deleteOne } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.driver) filter.driver = req.query.driver;
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    const result = await paginate(DeliveryTrip, filter, req, 'vehicle,driver,orders,createdBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
exports.getOne = getOne(DeliveryTrip, 'vehicle,driver,orders,createdBy');
exports.create = async (req, res, next) => {
  try { req.body.createdBy = req.user._id; const d = await DeliveryTrip.create(req.body); res.status(201).json({ success: true, data: d }); } catch(e){next(e);}
};
exports.updateProgress = async (req, res, next) => {
  try {
    const trip = await DeliveryTrip.findById(req.params.id);
    if (!trip) throw new AppError('Trip not found', 404);
    if (req.body.route) trip.route = req.body.route;
    if (req.body.status) trip.status = req.body.status;
    if (req.body.actualStartTime) trip.actualStartTime = req.body.actualStartTime;
    if (req.body.actualEndTime) trip.actualEndTime = req.body.actualEndTime;
    await trip.save();
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
};
exports.update = updateOne(DeliveryTrip);
exports.remove = deleteOne(DeliveryTrip);
