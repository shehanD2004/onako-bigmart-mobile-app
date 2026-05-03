const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: String,
    name: String,
    image: String,
    sellingType: { type: String, enum: ['weight', 'pack'], default: 'pack' },
    unit: { type: String, enum: ['kg', 'gram', 'pack', 'piece'], default: 'pack' },
    quantity: { 
      type: Number, 
      required: true,
      validate: {
        validator: function(v) {
          if (this.sellingType === 'pack') return Number.isInteger(v) && v >= 1;
          if (this.sellingType === 'weight') return v >= 0.01;
          return true;
        },
        message: 'Invalid quantity for the given selling type'
      }
    },
    pricePerUnit: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
  }],
  shippingAddress: {
    street: String, city: String, state: String,
    zip: String, country: String, phone: String,
  },
  billingAddress: {
    street: String, city: String, state: String,
    zip: String, country: String, phone: String,
  },
  pricing: {
    subtotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'wallet', 'bank_transfer'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped',
           'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  }],
  notes: { type: String, default: '' },
  assignedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryTrip' },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const d = new Date();
    const dateStr = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
