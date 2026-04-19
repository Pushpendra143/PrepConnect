const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// Stream webhook — called by Stream when a call ends.
// Stream sends an event payload including the call ID.
// We parse the call ID to find the booking and update its status.
router.post('/stream', async (req, res) => {
  try {
    const { type, call } = req.body;

    // acknowledge immediately so Stream doesn't retry
    res.status(200).json({ received: true });

    if (type === 'call.ended' && call && call.id) {
      // call.id is in format: prept-{bookingId}
      const parts = call.id.split('-');
      if (parts.length >= 2) {
        const bookingId = parts.slice(1).join('-');

        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'SCHEDULED') {
          booking.status = 'COMPLETED';
          await booking.save();
          console.log(`Booking ${bookingId} marked as COMPLETED via Stream webhook`);
        }
      }
    }

    if (type === 'call.recording_ready' && call) {
      const parts = call.id.split('-');
      if (parts.length >= 2) {
        const bookingId = parts.slice(1).join('-');
        const recordingUrl = call.recording_url || call.egress?.rtmp?.[0]?.url || '';

        if (recordingUrl) {
          await Booking.findByIdAndUpdate(bookingId, { recordingUrl });
          console.log(`Recording URL saved for booking ${bookingId}`);
        }
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    // already sent 200 — just log the error
  }
});

// AI provider webhook — called when the AI feedback generation is done.
// Wire this to your Gemini or OpenAI webhook if you use async generation.
router.post('/ai-feedback', async (req, res) => {
  try {
    const { bookingId, feedback } = req.body;

    if (!bookingId || !feedback) {
      return res.status(400).json({ message: 'bookingId and feedback are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.feedback = {
      summary: feedback.summary || '',
      overallRating: feedback.overallRating || '',
      technical: feedback.technical || '',
      communication: feedback.communication || '',
      problemSolving: feedback.problemSolving || '',
      strengths: feedback.strengths || [],
      improvements: feedback.improvements || [],
    };

    if (booking.status === 'SCHEDULED') {
      booking.status = 'COMPLETED';
    }

    await booking.save();

    res.json({ success: true, message: 'Feedback saved via webhook' });
  } catch (error) {
    console.error('AI feedback webhook error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
