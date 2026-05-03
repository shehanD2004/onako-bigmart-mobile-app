const ReturnRequest = require('../models/ReturnRequest');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const result = await paginate(ReturnRequest, filter, req, 'order,customer');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getMy = async (req, res, next) => {
  try {
    const result = await paginate(ReturnRequest, { customer: req.user._id }, req, 'order');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const ret = await ReturnRequest.findById(req.params.id).populate('order customer items.product reviewedBy');
    if (!ret) throw new AppError('Return request not found', 404);
    res.json({ success: true, data: ret });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    req.body.customer = req.user._id;
    const ret = await ReturnRequest.create(req.body);
    res.status(201).json({ success: true, data: ret });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (req.body.status === 'approved' || req.body.status === 'rejected') {
      req.body.reviewedBy = req.user._id;
      req.body.reviewedAt = new Date();
    }
    const ret = await ReturnRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ret) throw new AppError('Return request not found', 404);
    res.json({ success: true, data: ret });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await ReturnRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Return request deleted' });
  } catch (err) { next(err); }
};
