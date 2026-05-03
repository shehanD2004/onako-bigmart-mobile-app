const Product = require('../models/Product');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === 'true';
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerUnit = {};
      if (req.query.minPrice) filter.pricePerUnit.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.pricePerUnit.$lte = Number(req.query.maxPrice);
    }
    const result = await paginate(Product, filter, req, 'category,brand');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category brand createdBy');
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.getBySku = async (req, res, next) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() }).populate('category brand');
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, message: 'Product deleted permanently' });
  } catch (err) { next(err); }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, data: product, message: `Product ${product.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};
