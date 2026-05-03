const mongoose = require('mongoose');

const supplierInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date },
  paidDate: { type: Date },
  paymentMethod: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'overdue', 'paid', 'partially_paid', 'voided'],
    default: 'draft',
  },
  invoiceStatus: {
    type: String,
    enum: ['PENDING', 'MATCH_FAILED', 'MATCHED', 'APPROVED', 'PAID'],
    default: 'PENDING',
  },
  totalPaid: { type: Number, default: 0 },
  remainingBalance: { type: Number },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  payments: [{
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    method: { type: String },
    reference: { type: String },
  }],
  notes: { type: String, default: '' },
  attachments: [String],
}, { timestamps: true });

supplierInvoiceSchema.pre('save', function(next) {
  this.remainingBalance = this.totalAmount - this.totalPaid;
  if (this.remainingBalance < 0) {
    return next(new Error('Overpayment not allowed'));
  }
  this.paymentStatus = this.totalPaid === 0 ? 'unpaid' 
    : this.remainingBalance === 0 ? 'paid' : 'partial';
  next();
});

supplierInvoiceSchema.index({ supplier: 1, paymentStatus: 1 });

module.exports = mongoose.model('SupplierInvoice', supplierInvoiceSchema);
