const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "" },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: "Srilanka" },
    },
    paymentTerms: { type: String, default: "Net 30" },
    currency: { type: String, default: "LKR" },
    taxId: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    performanceScore: { type: Number, default: 100, min: 0, max: 100 },
    scoreDetails: {
      onTimeDelivery: { type: Number, default: 1 },
      fillRate: { type: Number, default: 1 },
      invoiceAccuracy: { type: Number, default: 1 },
      rejectionRate: { type: Number, default: 0 },
      disputeRate: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", supplierSchema);
