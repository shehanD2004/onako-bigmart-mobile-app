const AttendanceLog = require('../models/AttendanceLog');
const { paginate, getOne, createOne, updateOne, deleteOne } = require('./factory');
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.staff) filter.staff = req.query.staff;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }
    const result = await paginate(AttendanceLog, filter, req, 'staff,recordedBy');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
exports.getByStaff = async (req, res, next) => {
  try {
    const data = await AttendanceLog.find({ staff: req.params.id }).populate('recordedBy').sort('-date');
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
};
exports.getReport = async (req, res, next) => {
  try {
    const pipeline = [
      { $group: {
        _id: '$staff',
        totalDays: { $sum: 1 },
        presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        totalDeliveries: { $sum: '$deliveriesCompleted' },
        avgRating: { $avg: '$performanceRating' },
        totalHours: { $sum: '$hoursWorked' },
      }},
      { $lookup: { from: 'staffs', localField: '_id', foreignField: '_id', as: 'staffInfo' } },
      { $unwind: '$staffInfo' },
    ];
    const data = await AttendanceLog.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
exports.getOne = getOne(AttendanceLog, 'staff,recordedBy');
exports.create = async (req, res, next) => {
  try { req.body.recordedBy = req.user._id; const d = await AttendanceLog.create(req.body); res.status(201).json({ success: true, data: d }); } catch(e){next(e);}
};
exports.update = updateOne(AttendanceLog);
exports.remove = deleteOne(AttendanceLog);
