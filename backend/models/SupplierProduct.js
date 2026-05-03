const mongoose = require('mongoose');

const supplierProductSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplierSku: { type: String, default: '' },
  unitCost: { type: Number, required: true, min: [0.01, 'Cost must be positive'] },
  currency: { type: String, default: 'USD' },
  minOrderQty: { type: Number, default: 1, min: [1, 'MOQ must be at least 1'] },
  leadTimeDays: { type: Number, default: 7, min: [0, 'Lead time cannot be negative'] },
  isPreferred: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

supplierProductSchema.index({ supplier: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('SupplierProduct', supplierProductSchema);
