const express = require('express');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Request a withdrawal (interviewer only)
router.post('/', auth, async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid withdrawal amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'INTERVIEWER') {
      return res.status(403).json({ message: 'Only interviewers can request withdrawals' });
    }

    if (user.creditBalance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. You have ${user.creditBalance} credits.`,
      });
    }

    if (!accountDetails) {
      return res.status(400).json({ message: 'Account details are required' });
    }

    // deduct credits from balance
    await User.findByIdAndUpdate(req.user.id, { $inc: { creditBalance: -amount } });

    const withdrawal = new Withdrawal({
      interviewerId: req.user.id,
      amount,
      method: method || 'UPI',
      accountDetails,
      status: 'PENDING',
    });
    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal history for the current interviewer
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'INTERVIEWER') {
      return res.status(403).json({ message: 'Only interviewers can view withdrawals' });
    }

    const withdrawals = await Withdrawal.find({ interviewerId: req.user.id }).sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
