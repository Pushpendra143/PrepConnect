const express = require('express');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate a Stream call ID for a booking.
// In production you would call the Stream API. Here we generate a stable ID
// so both participants joining with the same booking ID land in the same room.
router.post('/generate-id', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const userId = req.user.id;
    if (
      booking.intervieweeId.toString() !== userId &&
      booking.interviewerId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Stable call ID derived from the booking ID — same for both participants
    const callId = `prept-${booking._id.toString()}`;

    res.json({ callId });
  } catch (error) {
    console.error('Generate call ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate a Stream call token for the current user.
// In production this would call Stream's token generation API using your
// Stream API key + secret. We return a placeholder token here that the
// frontend can swap for a real one once you add Stream credentials.
router.post('/token', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const userId = req.user.id;
    if (
      booking.intervieweeId.toString() !== userId &&
      booking.interviewerId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // When you add your Stream credentials, replace this block with the
    // official Stream Node SDK: StreamClient.generateUserToken(userId)
    const STREAM_API_KEY = process.env.STREAM_API_KEY || '';
    const STREAM_SECRET = process.env.STREAM_SECRET || '';

    let token;

    if (STREAM_API_KEY && STREAM_SECRET) {
      // Real Stream token generation (requires @stream-io/node-sdk)
      // const { StreamClient } = require('@stream-io/node-sdk');
      // const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET);
      // token = client.generateUserToken({ user_id: userId });
      token = `stream-token-${userId}-${Date.now()}`;
    } else {
      // Fallback demo token — replace with real Stream integration
      token = `demo-token-${userId}-${Date.now()}`;
    }

    const callId = `prept-${booking._id.toString()}`;

    res.json({
      token,
      callId,
      userId,
      apiKey: STREAM_API_KEY || 'demo-key',
    });
  } catch (error) {
    console.error('Generate call token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
