const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// helper to sign a fresh JWT for a user
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'prept_fallback_secret',
    { expiresIn: '7d' }
  );
}

// helper to build the safe user payload sent to the client
function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    imageUrl: user.imageUrl,
    credits: user.credits,
    creditBalance: user.creditBalance,
    creditRate: user.creditRate,
    title: user.title,
    company: user.company,
    bio: user.bio,
    yearsExp: user.yearsExp,
    categories: user.categories,
    currentPlan: user.currentPlan,
  };
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'UNASSIGNED',
    });
    await user.save();

    const token = signToken(user);

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile (used on app reload to rehydrate auth state)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(buildUserPayload(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Onboarding — pick role and fill out interviewer profile
router.put('/onboarding', auth, async (req, res) => {
  try {
    const { role, title, company, yearsExp, bio, categories } = req.body;

    if (!role || !['INTERVIEWEE', 'INTERVIEWER'].includes(role)) {
      return res.status(400).json({ message: 'Please select a valid role' });
    }

    const updateData = { role };

    if (role === 'INTERVIEWER') {
      if (!title || !company || !yearsExp || !bio || !categories || categories.length === 0) {
        return res.status(400).json({ message: 'Please complete all required interviewer fields' });
      }
      updateData.title = title.trim();
      updateData.company = company.trim();
      updateData.yearsExp = Number(yearsExp);
      updateData.bio = bio.trim();
      updateData.categories = categories;
    }

    if (role === 'INTERVIEWEE') {
      updateData.credits = 5;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');

    // issue a fresh token so the client role is updated
    const token = signToken(updatedUser);

    res.json({ success: true, token, user: buildUserPayload(updatedUser) });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Server error during onboarding' });
  }
});

// Get all interviewers — for the Explore page
router.get('/interviewers', async (req, res) => {
  try {
    const Availability = require('../models/Availability');

    const interviewers = await User.find({ role: 'INTERVIEWER' })
      .select('-password')
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      interviewers.map(async (interviewer) => {
        const availability = await Availability.findOne({
          interviewerId: interviewer._id,
          status: 'AVAILABLE',
        }).select('startTime endTime');

        return {
          ...interviewer.toObject(),
          id: interviewer._id,
          availabilities: availability ? [availability] : [],
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('Get interviewers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single interviewer — for the profile / booking page
router.get('/interviewers/:id', async (req, res) => {
  try {
    const Availability = require('../models/Availability');
    const Booking = require('../models/Booking');

    const interviewer = await User.findById(req.params.id).select('-password');
    if (!interviewer || interviewer.role !== 'INTERVIEWER') {
      return res.status(404).json({ message: 'Interviewer not found' });
    }

    const availability = await Availability.findOne({
      interviewerId: interviewer._id,
      status: 'AVAILABLE',
    });

    const bookedSlots = await Booking.find({
      interviewerId: interviewer._id,
      status: 'SCHEDULED',
    }).select('startTime endTime');

    res.json({
      ...interviewer.toObject(),
      id: interviewer._id,
      availability,
      bookedSlots,
    });
  } catch (error) {
    console.error('Get interviewer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (name, imageUrl, bio, etc.)
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name', 'imageUrl', 'bio', 'title', 'company', 'yearsExp', 'categories', 'creditRate'];
    const updateData = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');

    res.json({ success: true, user: buildUserPayload(updatedUser) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
