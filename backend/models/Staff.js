const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  role: {
    type: String,
    enum: ['driver', 'loader', 'supervisor', 'dispatcher'],
    default: 'driver',
  },
  phone: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true },
  licenseNumber: { type: String, default: '' },
  licenseExpiry: { type: Date },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'flexible'],
    default: 'morning',
  },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  joinDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
