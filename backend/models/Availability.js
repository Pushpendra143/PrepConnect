const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'BLOCKED'], default: 'AVAILABLE' },
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
