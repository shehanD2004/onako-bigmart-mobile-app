const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type: {
    type: String, required: true,
    enum: ['restock', 'sale', 'transfer_in', 'transfer_out', 'damage', 'adjustment', 'return', 'purchase'],
  },
  quantityChange: { type: Number, required: true },
  quantityBefore: { type: Number, default: 0 },
  quantityAfter: { type: Number, default: 0 },
  referenceType: { type: String, enum: ['Order', 'PurchaseOrder', 'SupplierDelivery', 'Manual'], default: 'Manual' },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  notes: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

stockMovementSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
