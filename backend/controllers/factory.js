// Generic CRUD factory for simple models
const { AppError } = require('../middleware/errorHandler');

const paginate = async (Model, query, req, populateFields = '') => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const total = await Model.countDocuments(query);
  let q = Model.find(query).skip(skip).limit(limit);
  if (populateFields) {
    const fields = populateFields.split(',');
    fields.forEach(f => { q = q.populate(f.trim()); });
  }
  if (req.query.sort) {
    const sortObj = {};
    const parts = req.query.sort.split(',');
    parts.forEach(p => {
      if (p.startsWith('-')) sortObj[p.substring(1)] = -1;
      else sortObj[p] = 1;
    });
    q = q.sort(sortObj);
  } else {
    q = q.sort({ createdAt: -1 });
  }
  const data = await q;
  return { data, total, page, pages: Math.ceil(total / limit), limit };
};

const getAll = (Model, populateFields = '') => async (req, res, next) => {
  try {
    const filter = {};
    // generic search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const result = await paginate(Model, filter, req, populateFields);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getOne = (Model, populateFields = '') => async (req, res, next) => {
  try {
    let q = Model.findById(req.params.id);
    if (populateFields) {
      populateFields.split(',').forEach(f => { q = q.populate(f.trim()); });
    }
    const doc = await q;
    if (!doc) throw new AppError('Not found', 404);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!doc) throw new AppError('Not found', 404);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new AppError('Not found', 404);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { paginate, getAll, getOne, createOne, updateOne, deleteOne };
