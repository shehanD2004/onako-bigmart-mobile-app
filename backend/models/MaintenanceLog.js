const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: {
    type: String,
    enum: ['service', 'repair', 'fuel', 'inspection', 'tire'],
    default: 'service',
  },
  description: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  vendor: { type: String, default: '' },
  mileageAtService: { type: Number, default: 0 },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  attachments: [String],
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
