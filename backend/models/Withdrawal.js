const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['UPI', 'BANK_TRANSFER', 'PAYPAL'], default: 'UPI' },
  accountDetails: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'], default: 'PENDING' },
  note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
