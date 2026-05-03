const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['warehouse', 'shelf', 'zone', 'bin'], default: 'warehouse' },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'US' },
  },
  capacity: { type: Number, default: 0 },
  managerName: { type: String, default: '' },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
