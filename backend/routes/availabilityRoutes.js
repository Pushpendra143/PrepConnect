const express = require('express');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

const router = express.Router();

// Set availability (create or update)
router.post('/', auth, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Start and end time required' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // check if user already has an availability record
    const existing = await Availability.findOne({
      interviewerId: req.user.id,
      status: 'AVAILABLE'
    });

    if (existing) {
      // update the existing one
      existing.startTime = new Date(startTime);
      existing.endTime = new Date(endTime);
      await existing.save();
      return res.json({ success: true, availability: existing });
    }

    // create new availability
    const availability = new Availability({
      interviewerId: req.user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'AVAILABLE',
    });
    await availability.save();

    res.status(201).json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user's availability
router.get('/me', auth, async (req, res) => {
  try {
    const availability = await Availability.findOne({
      interviewerId: req.user.id,
      status: 'AVAILABLE'
    });
    res.json(availability || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
