const Order = require('../models/Order');
const StockEntry = require('../models/StockEntry');
const StockMovement = require('../models/StockMovement');
const { paginate } = require('./factory');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const result = await paginate(Order, filter, req, 'customer');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getMy = async (req, res, next) => {
  try {
    const result = await paginate(Order, { customer: req.user._id }, req);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name slug images')
      .populate('statusHistory.updatedBy', 'name');
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) throw new AppError('Order not found', 404);

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory
      }
    });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items || !items.length) throw new AppError('Order must have items', 400);

    const Product = require('../models/Product');
    let subtotal = 0;
    const orderItems = [];
    
    // Secure Pricing: Lookup products from DB
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) throw new AppError(`Product not found: ${item.product}`, 404);
      
      const unitPrice = product.pricePerUnit || 0; // The secure base price
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({ 
        product: product._id, 
        sku: product.sku,
        name: product.name,
        image: product.images?.[0]?.url || '',
        quantity: item.quantity,
        pricePerUnit: unitPrice,
        discount: 0,
        subtotal: itemSubtotal
      });
    }

    const tax = 0;
    const shippingCost = subtotal > 5000 ? 0 : 250; // Free shipping over Rs 5000
    const total = subtotal + tax + shippingCost;

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: shippingAddress,
      pricing: { subtotal, tax, shippingCost, discount: 0, total },
      paymentMethod: paymentMethod || 'cod',
      statusHistory: [{ status: 'pending', note: 'Order created', updatedBy: req.user._id }],
      notes,
    });

    // Decrement stock
    for (const item of orderItems) {
      const stock = await StockEntry.findOne({ product: item.product });
      if (stock) {
        const before = stock.quantity;
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
        stock.reservedQuantity += item.quantity;
        await stock.save();
        await StockMovement.create({
          product: item.product, warehouse: stock.warehouse,
          type: 'sale', quantityChange: -item.quantity,
          quantityBefore: before, quantityAfter: stock.quantity,
          referenceType: 'Order', referenceId: order._id,
          performedBy: req.user._id,
        });
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    order.orderStatus = status;
    order.statusHistory.push({ status, note, updatedBy: req.user._id });
    if (status === 'delivered') order.paymentStatus = 'paid';
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled', updatedBy: req.user._id });
    await order.save();

    // Reverse stock
    for (const item of order.items) {
      const stock = await StockEntry.findOne({ product: item.product });
      if (stock) {
        stock.quantity += item.quantity;
        stock.reservedQuantity = Math.max(0, stock.reservedQuantity - item.quantity);
        await stock.save();
      }
    }
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) { next(err); }
};
