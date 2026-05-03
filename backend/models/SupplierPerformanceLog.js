const mongoose = require('mongoose');

const supplierPerformanceLogSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierDelivery' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierInvoice' },
  onTimeDelivery: { type: Boolean, default: null },
  fillRate: { type: Number, default: 0 },
  rejectionRate: { type: Number, default: 0 },
  invoiceAccuracy: { type: Boolean, default: null },
  disputeOccurred: { type: Boolean, default: false },
}, { timestamps: true });

supplierPerformanceLogSchema.index({ supplier: 1, createdAt: -1 });

module.exports = mongoose.model('SupplierPerformanceLog', supplierPerformanceLogSchema);
