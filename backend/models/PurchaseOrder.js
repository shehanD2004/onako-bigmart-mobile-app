const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: String,
    description: String,
    orderedQty: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    receivedQty: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: [0.01, 'Unit cost must be positive'] },
    total: { type: Number, default: 0 },
  }],
  pricing: {
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled', 'closed'],
    default: 'draft',
  },
  expectedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  notes: { type: String, default: '' },
  attachments: [String],
  manualApproval: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function (next) {
  if (!this.poNumber) {
    const d = new Date();
    const dateStr = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
