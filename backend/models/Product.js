const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  sellingType: { type: String, enum: ['weight', 'pack'], default: 'pack' },
  unit: { type: String, enum: ['kg', 'gram', 'pack', 'piece'], default: 'pack' },
  pricePerUnit: { type: Number, required: [true, 'Price per unit is required'], min: 0 },
  stock: { type: Number, default: 0 },
  compareAtPrice: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  images: [{
    url: String,
    altText: String,
    isPrimary: { type: Boolean, default: false },
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String, trim: true }],
  attributes: [{
    name: String,
    value: String,
  }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  weight: { type: Number, default: 0 },
  dimensions: {
    l: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    h: { type: Number, default: 0 },
  },
  lowStockThreshold: { type: Number, default: 10 },
  reorderQuantity: { type: Number, default: 50 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
