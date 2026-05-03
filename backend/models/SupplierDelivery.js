const mongoose = require('mongoose');

const supplierDeliverySchema = new mongoose.Schema({
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  deliveredItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    expectedQty: { type: Number, default: 0 },
    receivedQty: { type: Number, default: 0 },
    rejectedQty: { type: Number, default: 0 },
    condition: { type: String, default: 'good' },
    batchNumber: String,
    expiryDate: Date,
  }],
  deliveryDate: { type: Date, default: Date.now },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qualityNotes: { type: String, default: '' },
  attachments: [String],
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'complete', 'disputed', 'cancelled'],
    default: 'pending',
  },
  disputeStatus: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'NONE'], default: 'NONE' },
  resolutionAction: { type: String, enum: ['ACCEPTED', 'PARTIAL_ACCEPT', 'REJECTED_RETURN', 'PENDING'], default: 'PENDING' },
  resolutionNotes: { type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('SupplierDelivery', supplierDeliverySchema);
