const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const StockEntry = require('../models/StockEntry');
const { AppError } = require('../middleware/errorHandler');

// GET /api/store/products - public catalog
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'name') sort = { name: 1 };

    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .populate('category brand')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) { next(err); }
};

// GET /api/store/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category brand');
    if (!product) throw new AppError('Product not found', 404);
    // Get stock info
    const stockEntries = await StockEntry.find({ product: product._id });
    const totalStock = stockEntries.reduce((s, e) => s + e.quantity, 0);
    res.json({ success: true, data: { ...product.toObject(), totalStock } });
  } catch (err) { next(err); }
};

// GET /api/store/categories
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true, parent: null }).populate({
      path: 'children', match: { isActive: true },
    }).sort('sortOrder');
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};

// GET /api/store/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category brand').limit(12);
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
};

// GET /api/dashboard/stats (admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);

    const [ordersToday, revenueToday, lowStock, pendingReturns, recentOrders, revenueChart] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      StockEntry.countDocuments({ quantity: { $lte: 10 } }),
      (await import('../models/ReturnRequest.js')).default ?
        0 : require('../models/ReturnRequest').countDocuments({ status: 'pending' }),
      Order.find().populate('customer', 'name email').sort('-createdAt').limit(10),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, orderStatus: { $ne: 'cancelled' } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
    ]);

    const ReturnRequest = require('../models/ReturnRequest');
    const pendingRetCount = await ReturnRequest.countDocuments({ status: 'pending' });
    const Vehicle = require('../models/Vehicle');
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const DeliveryTrip = require('../models/DeliveryTrip');
    const activeDeliveries = await DeliveryTrip.countDocuments({ status: 'in_progress' });

    res.json({
      success: true,
      data: {
        ordersToday,
        revenueToday: revenueToday[0]?.total || 0,
        lowStockAlerts: lowStock,
        pendingReturns: pendingRetCount,
        availableVehicles,
        activeDeliveries,
        recentOrders,
        revenueChart,
      },
    });
  } catch (err) { next(err); }
};
