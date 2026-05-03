const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  make: { type: String, default: '' },
  model: { type: String, default: '' },
  year: { type: Number },
  type: {
    type: String,
    enum: ['truck', 'van', 'bike', 'car', 'motorcycle'],
    default: 'van',
  },
  capacity: {
    weight: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
  },
  fuelType: { type: String, default: 'diesel' },
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'retired'],
    default: 'available',
  },
  currentMileage: { type: Number, default: 0 },
  maintenanceDueAt: { type: Number, default: 0 },
  insuranceExpiry: { type: Date },
  licenseExpiry: { type: Date },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
