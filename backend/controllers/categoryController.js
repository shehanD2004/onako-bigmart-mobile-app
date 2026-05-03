const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

exports.getTree = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const cats = await Category.find({ ...filter, parent: null }).populate({
      path: 'children', populate: { path: 'children' },
    }).sort('sortOrder');
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};

exports.getFlat = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const cats = await Category.find(filter).populate('parent').sort('sortOrder');
    res.json({ success: true, data: cats, total: cats.length });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id).populate('parent children');
    if (!cat) throw new AppError('Category not found', 404);
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) throw new AppError('Category not found', 404);
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const count = await Product.countDocuments({ category: req.params.id });
    if (count > 0) throw new AppError('Cannot delete category with assigned products', 400);
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};
