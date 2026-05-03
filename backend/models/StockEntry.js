const mongoose = require('mongoose');

const stockEntrySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'pcs' },
  batchNumber: { type: String, default: '' },
  expiryDate: { type: Date },
  lastCountedAt: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

stockEntrySchema.virtual('availableQuantity').get(function () {
  return this.quantity - this.reservedQuantity;
});

stockEntrySchema.index({ product: 1, warehouse: 1 }, { unique: true });

stockEntrySchema.pre('save', function(next) {
  if (this.quantity < 0) {
    return next(new Error('Stock quantity cannot go negative'));
  }
  next();
});

module.exports = mongoose.model('StockEntry', stockEntrySchema);
