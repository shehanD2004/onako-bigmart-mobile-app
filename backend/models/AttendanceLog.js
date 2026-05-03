const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, required: true },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'flexible'],
    default: 'morning',
  },
  clockIn: { type: String, default: '' },
  clockOut: { type: String, default: '' },
  hoursWorked: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'leave'],
    default: 'present',
  },
  deliveriesCompleted: { type: Number, default: 0 },
  onTimeDeliveries: { type: Number, default: 0 },
  performanceRating: { type: Number, min: 1, max: 5, default: 3 },
  notes: { type: String, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
