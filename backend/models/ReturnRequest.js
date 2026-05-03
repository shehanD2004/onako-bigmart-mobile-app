const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    reason: String,
  }],
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  images: [String],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  refundAmount: { type: Number, default: 0 },
  refundMethod: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
