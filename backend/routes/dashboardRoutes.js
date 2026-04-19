const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get interviewer stats — credit balance, earnings, session counts
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'INTERVIEWER') {
      return res.status(403).json({ message: 'Only interviewers can access this dashboard' });
    }

    const [completedBookings, scheduledBookings, cancelledBookings, withdrawals] = await Promise.all([
      Booking.find({ interviewerId: req.user.id, status: 'COMPLETED' }),
      Booking.find({ interviewerId: req.user.id, status: 'SCHEDULED' }),
      Booking.find({ interviewerId: req.user.id, status: 'CANCELLED' }),
      Withdrawal.find({ interviewerId: req.user.id }),
    ]);

    const totalEarned = completedBookings.reduce((sum, b) => sum + b.creditsCharged, 0);
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    res.json({
      creditBalance: user.creditBalance,
      creditRate: user.creditRate,
      totalEarned,
      totalWithdrawn,
      completedSessions: completedBookings.length,
      scheduledSessions: scheduledBookings.length,
      cancelledSessions: cancelledBookings.length,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
