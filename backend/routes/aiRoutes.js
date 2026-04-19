const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// AI Question Generator
// In production, wire this to Google Gemini or OpenAI.
// We return a curated set of questions based on the requested category and level.
router.post('/questions', auth, async (req, res) => {
  try {
    const { category, level, topic } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // When you add your AI key, replace this with a real API call:
    // const response = await callGemini({ category, level, topic });
    const questions = generateQuestions(category, level, topic);

    res.json({ questions });
  } catch (error) {
    console.error('AI questions error:', error);
    res.status(500).json({ message: 'Server error generating questions' });
  }
});

// Generate AI feedback for a completed session
// In production, wire this to Gemini with the session transcript/notes.
router.post('/feedback', auth, async (req, res) => {
  try {
    const { bookingId, notes, category, level } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.interviewerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the interviewer can generate feedback' });
    }

    // Placeholder AI feedback — swap for real Gemini/OpenAI call
    const feedback = {
      summary: `Session completed for ${category || 'general'} interview. The candidate demonstrated ${level === 'senior' ? 'strong' : 'solid'} foundational knowledge.`,
      overallRating: 'GOOD',
      technical: 'Good understanding of core concepts. Some gaps in advanced topics.',
      communication: 'Clear and articulate. Good at explaining thought process.',
      problemSolving: 'Methodical approach. Could improve on edge case identification.',
      strengths: ['Clear communication', 'Strong fundamentals', 'Good problem breakdown'],
      improvements: ['Edge case handling', 'Time complexity analysis', 'Advanced patterns'],
    };

    res.json({ feedback });
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ message: 'Server error generating feedback' });
  }
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateQuestions(category, level, topic) {
  const banks = {
    FRONTEND: [
      'Explain the difference between `null` and `undefined` in JavaScript.',
      'How does the React reconciliation algorithm work?',
      'What is the virtual DOM and why does React use it?',
      'Explain the event loop in JavaScript.',
      'How would you optimise a React app that is re-rendering too often?',
      'What are React hooks? Explain `useState` and `useEffect`.',
      'Describe the difference between controlled and uncontrolled components.',
      'How does CSS specificity work? What order do rules apply in?',
      'What is a closure in JavaScript? Give a real-world example.',
      'How would you implement code splitting in a large React application?',
    ],
    BACKEND: [
      'How would you design a REST API for a booking system?',
      'Explain the difference between SQL and NoSQL databases.',
      'What is an index in a database and when would you use one?',
      'How do you handle race conditions in Node.js?',
      'Explain JWT authentication and its security considerations.',
      'What is the difference between horizontal and vertical scaling?',
      'How would you implement rate limiting in an Express application?',
      'Describe how you would handle database migrations in production.',
      'What are the ACID properties of a database transaction?',
      'How does connection pooling improve database performance?',
    ],
    FULLSTACK: [
      'How would you design a real-time chat application?',
      'Explain the request lifecycle from browser to database and back.',
      'How do you manage state in a large full-stack application?',
      'Describe a microservices architecture and its trade-offs.',
      'How would you handle authentication across a frontend and API?',
      'What is CORS and how do you configure it correctly?',
      'How would you implement pagination for a large dataset?',
      'Explain the difference between server-side and client-side rendering.',
      'How do you approach caching in a full-stack application?',
      'Describe how you would debug a production performance issue.',
    ],
    DSA: [
      'Given an array of integers, find two numbers that sum to a target.',
      'How would you detect a cycle in a linked list?',
      'Explain the time and space complexity of merge sort.',
      'Implement a function to check if a string is a palindrome.',
      'How would you find the lowest common ancestor of two nodes in a binary tree?',
      'Explain the difference between BFS and DFS and when to use each.',
      'How does dynamic programming differ from divide and conquer?',
      'Implement a stack using only queues.',
      'Given a matrix, find the number of islands (connected groups of 1s).',
      'How would you design a data structure that supports insert, delete, and getRandom in O(1)?',
    ],
    SYSTEM_DESIGN: [
      'Design a URL shortening service like bit.ly.',
      'How would you design Twitter\'s news feed?',
      'Design a distributed key-value store.',
      'How would you build a real-time collaborative document editor?',
      'Design a ride-sharing service like Uber.',
      'How would you design a notification system that sends millions of push notifications?',
      'Design a video streaming service like YouTube.',
      'How would you build a search autocomplete system?',
      'Design a distributed job scheduler.',
      'How would you architect a multi-tenant SaaS application?',
    ],
    BEHAVIORAL: [
      'Tell me about a time you had a conflict with a teammate. How did you resolve it?',
      'Describe a project you\'re most proud of and your specific contribution.',
      'Tell me about a time you made a significant mistake. What happened?',
      'How do you prioritise when you have multiple high-priority tasks?',
      'Describe a situation where you had to learn something new very quickly.',
      'Tell me about a time you disagreed with your manager\'s decision.',
      'How have you handled working with a difficult stakeholder?',
      'Describe a time you had to deliver bad news to your team or manager.',
      'What motivates you in your work and why are you looking for a new role?',
      'Tell me about a time you went above and beyond for a project or customer.',
    ],
    DEVOPS: [
      'Explain the difference between Docker containers and VMs.',
      'How do you design a CI/CD pipeline for a Node.js application?',
      'What is Kubernetes and what problem does it solve?',
      'How would you set up monitoring and alerting for a production service?',
      'Explain blue-green deployments and when you would use them.',
      'What is infrastructure as code? Have you used Terraform?',
      'How do you manage secrets in a containerised environment?',
      'Explain the difference between horizontal pod autoscaling and vertical pod autoscaling.',
      'How would you troubleshoot a service that is intermittently failing in production?',
      'What is a service mesh and when would you need one?',
    ],
    MOBILE: [
      'Explain the React Native bridge and how native modules work.',
      'How would you optimise a React Native list with thousands of items?',
      'What are the differences between React Native and Flutter?',
      'How do you handle offline functionality in a mobile app?',
      'Explain how push notifications work on iOS and Android.',
      'How would you approach state management in a large React Native app?',
      'What is the difference between Expo and bare React Native?',
      'How do you handle deep linking in React Native?',
      'Describe the process of submitting an app to the App Store.',
      'How would you implement in-app purchases?',
    ],
  };

  const pool = banks[category] || banks.BACKEND;

  // shuffle and return 6 questions
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6).map((q, i) => ({
    id: i + 1,
    question: q,
    category,
    difficulty: level || 'mid',
  }));
}

module.exports = router;
