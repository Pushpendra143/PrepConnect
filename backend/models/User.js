const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  role: { type: String, enum: ['UNASSIGNED', 'INTERVIEWEE', 'INTERVIEWER'], default: 'UNASSIGNED' },

  // interviewee fields
  credits: { type: Number, default: 5 },
  currentPlan: { type: String, default: 'free' },

  // interviewer fields
  bio: { type: String, default: '' },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  yearsExp: { type: Number, default: 0 },
  categories: [{ type: String }],
  creditRate: { type: Number, default: 1 },
  creditBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
