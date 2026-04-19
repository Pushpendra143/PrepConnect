const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  intervieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  creditsCharged: { type: Number, default: 1 },
  topic: { type: String, default: 'General Mock Interview' },
  callId: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  feedback: {
    summary: { type: String, default: '' },
    overallRating: { type: String, enum: ['POOR', 'AVERAGE', 'GOOD', 'EXCELLENT', ''], default: '' },
    technical: { type: String, default: '' },
    communication: { type: String, default: '' },
    problemSolving: { type: String, default: '' },
    strengths: [String],
    improvements: [String],
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
