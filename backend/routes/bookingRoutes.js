const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { interviewerId, startTime, endTime, topic } = req.body;

    if (!interviewerId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Interviewer, start time, and end time are required' });
    }

    const interviewer = await User.findById(interviewerId);
    if (!interviewer || interviewer.role !== 'INTERVIEWER') {
      return res.status(400).json({ message: 'Interviewer not found' });
    }

    const interviewee = await User.findById(req.user.id);
    if (!interviewee) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (interviewee.credits < interviewer.creditRate) {
      return res.status(400).json({
        message: `You need ${interviewer.creditRate} credits to book this session. You have ${interviewee.credits}.`,
      });
    }

    // make sure slot isn't already taken
    const conflict = await Booking.findOne({
      interviewerId,
      status: 'SCHEDULED',
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const booking = new Booking({
      intervieweeId: req.user.id,
      interviewerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      topic: topic ? topic.trim() : 'General Mock Interview',
      creditsCharged: interviewer.creditRate,
      status: 'SCHEDULED',
    });
    await booking.save();

    // deduct credits from interviewee
    await User.findByIdAndUpdate(req.user.id, { $inc: { credits: -interviewer.creditRate } });

    // add to interviewer balance
    await User.findByIdAndUpdate(interviewerId, { $inc: { creditBalance: interviewer.creditRate } });

    const populated = await Booking.findById(booking._id)
      .populate('interviewerId', 'name email imageUrl title company categories')
      .populate('intervieweeId', 'name email imageUrl');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// Get bookings for the current user (both roles)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const query = user.role === 'INTERVIEWER'
      ? { interviewerId: req.user.id }
      : { intervieweeId: req.user.id };

    const bookings = await Booking.find(query)
      .populate('interviewerId', 'name email imageUrl title company categories creditRate')
      .populate('intervieweeId', 'name email imageUrl')
      .sort({ startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('interviewerId', 'name email imageUrl title company categories creditRate')
      .populate('intervieweeId', 'name email imageUrl');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user.id;
    if (
      booking.intervieweeId._id.toString() !== userId &&
      booking.interviewerId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a booking as completed (called by interviewer or webhook)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.interviewerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the interviewer can mark a session as completed' });
    }

    if (booking.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Only scheduled bookings can be completed' });
    }

    booking.status = 'COMPLETED';
    await booking.save();

    res.json({ success: true, message: 'Session marked as completed', booking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user.id;
    if (
      booking.intervieweeId.toString() !== userId &&
      booking.interviewerId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Only scheduled bookings can be cancelled' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    // refund credits to interviewee
    await User.findByIdAndUpdate(booking.intervieweeId, {
      $inc: { credits: booking.creditsCharged },
    });

    // deduct from interviewer balance
    await User.findByIdAndUpdate(booking.interviewerId, {
      $inc: { creditBalance: -booking.creditsCharged },
    });

    res.json({ success: true, message: 'Booking cancelled and credits refunded' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save AI feedback to a booking (interviewer submits post-session)
router.put('/:id/feedback', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.interviewerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the interviewer can submit feedback' });
    }

    const { summary, overallRating, technical, communication, problemSolving, strengths, improvements } = req.body;

    booking.feedback = {
      summary: summary || '',
      overallRating: overallRating || '',
      technical: technical || '',
      communication: communication || '',
      problemSolving: problemSolving || '',
      strengths: strengths || [],
      improvements: improvements || [],
    };

    if (booking.status === 'SCHEDULED') {
      booking.status = 'COMPLETED';
    }

    await booking.save();

    res.json({ success: true, message: 'Feedback saved', booking });
  } catch (error) {
    console.error('Save feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a booking record (only after it's cancelled/completed)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user.id;
    if (
      booking.intervieweeId.toString() !== userId &&
      booking.interviewerId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await booking.deleteOne();
    res.json({ success: true, message: 'Booking removed' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
