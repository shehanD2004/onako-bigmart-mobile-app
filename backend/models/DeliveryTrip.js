const mongoose = require('mongoose');

const deliveryTripSchema = new mongoose.Schema({
  tripCode: { type: String, unique: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  plannedDate: { type: Date },
  plannedStartTime: { type: String, default: '' },
  plannedEndTime: { type: String, default: '' },
  actualStartTime: { type: String, default: '' },
  actualEndTime: { type: String, default: '' },
  route: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    address: String,
    sequence: Number,
    status: { type: String, enum: ['pending', 'arrived', 'completed', 'failed'], default: 'pending' },
    arrivedAt: Date,
    completedAt: Date,
    notes: String,
  }],
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned',
  },
  totalDistance: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

deliveryTripSchema.pre('save', async function (next) {
  if (!this.tripCode) {
    const d = new Date();
    const dateStr = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const count = await mongoose.model('DeliveryTrip').countDocuments();
    this.tripCode = `TRIP-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DeliveryTrip', deliveryTripSchema);
