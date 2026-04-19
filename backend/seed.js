const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Booking = require('./models/Booking');
const Availability = require('./models/Availability');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview_platform';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // wipe old data
  await User.deleteMany({});
  await Booking.deleteMany({});
  await Availability.deleteMany({});
  console.log('Old data cleared.');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  // ─── INTERVIEWERS ───────────────────────────────────────
  const interviewers = await User.insertMany([
    {
      name: 'Aarav Sharma',
      email: 'aarav@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'INTERVIEWER',
      title: 'Senior Frontend Engineer',
      company: 'Google',
      yearsExp: 7,
      bio: 'I specialize in React performance and System Design interviews. I have conducted 200+ interviews at Google and love helping engineers crack the bar.',
      categories: ['FRONTEND', 'SYSTEM_DESIGN'],
      creditRate: 3,
      creditBalance: 45,
    },
    {
      name: 'Priya Patel',
      email: 'priya@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'INTERVIEWER',
      title: 'Staff Software Engineer',
      company: 'Meta',
      yearsExp: 10,
      bio: 'Full-stack engineer with deep expertise in distributed systems. I focus on system design and behavioral rounds — the two areas most candidates struggle with.',
      categories: ['FULLSTACK', 'SYSTEM_DESIGN', 'BEHAVIORAL'],
      creditRate: 5,
      creditBalance: 120,
    },
    {
      name: 'Rohit Verma',
      email: 'rohit@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
      role: 'INTERVIEWER',
      title: 'Backend Lead',
      company: 'Amazon',
      yearsExp: 5,
      bio: 'Backend specialist with production experience in microservices, Kubernetes and AWS. I can help you nail DSA and backend system design rounds.',
      categories: ['BACKEND', 'DSA', 'DEVOPS'],
      creditRate: 2,
      creditBalance: 30,
    },
    {
      name: 'Sneha Gupta',
      email: 'sneha@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      role: 'INTERVIEWER',
      title: 'Engineering Manager',
      company: 'Microsoft',
      yearsExp: 8,
      bio: 'I have hired 50+ engineers at Microsoft. My sessions focus on behavioral and leadership interviews — the stuff that separates good from great candidates.',
      categories: ['BEHAVIORAL', 'FULLSTACK'],
      creditRate: 4,
      creditBalance: 80,
    },
    {
      name: 'Karan Singh',
      email: 'karan@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
      role: 'INTERVIEWER',
      title: 'Mobile Lead',
      company: 'Uber',
      yearsExp: 6,
      bio: 'React Native and iOS specialist. I build and review mobile apps at scale. My mock interviews cover mobile architecture, performance, and DSA.',
      categories: ['MOBILE', 'FRONTEND', 'DSA'],
      creditRate: 3,
      creditBalance: 55,
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya@prept.com',
      password,
      imageUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      role: 'INTERVIEWER',
      title: 'DevOps Engineer',
      company: 'Netflix',
      yearsExp: 4,
      bio: 'CI/CD pipelines, Docker, Terraform — I live and breathe DevOps. Let me help you prepare for infrastructure and cloud-focused interviews.',
      categories: ['DEVOPS', 'BACKEND'],
      creditRate: 2,
      creditBalance: 20,
    },
  ]);

  console.log(`Created ${interviewers.length} interviewers.`);

  // ─── INTERVIEWEES ───────────────────────────────────────
  const interviewees = await User.insertMany([
    {
      name: 'Pushpendra Thakkar',
      email: 'pushpendra@test.com',
      password,
      role: 'INTERVIEWEE',
      credits: 10,
      imageUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
    },
    {
      name: 'Meera Joshi',
      email: 'meera@test.com',
      password,
      role: 'INTERVIEWEE',
      credits: 5,
      imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    },
    {
      name: 'Arjun Nair',
      email: 'arjun@test.com',
      password,
      role: 'INTERVIEWEE',
      credits: 3,
      imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
    },
  ]);

  console.log(`Created ${interviewees.length} interviewees.`);

  // ─── AVAILABILITY ───────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const availabilities = await Availability.insertMany(
    interviewers.map((interviewer, i) => {
      const start = new Date(tomorrow);
      start.setHours(9 + i, 0, 0, 0);
      const end = new Date(tomorrow);
      end.setHours(17 + (i % 2), 0, 0, 0);

      return {
        interviewerId: interviewer._id,
        startTime: start,
        endTime: end,
        status: 'AVAILABLE',
      };
    })
  );

  console.log(`Created ${availabilities.length} availability slots.`);

  // ─── BOOKINGS ───────────────────────────────────────────
  const now = new Date();
  const bookings = await Booking.insertMany([
    {
      intervieweeId: interviewees[0]._id,
      interviewerId: interviewers[0]._id,
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10.75 * 60 * 60 * 1000),
      status: 'SCHEDULED',
      creditsCharged: 3,
      topic: 'React Performance & System Design',
    },
    {
      intervieweeId: interviewees[0]._id,
      interviewerId: interviewers[1]._id,
      startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 14.75 * 60 * 60 * 1000),
      status: 'SCHEDULED',
      creditsCharged: 5,
      topic: 'Full Stack System Design',
    },
    {
      intervieweeId: interviewees[1]._id,
      interviewerId: interviewers[2]._id,
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 11.75 * 60 * 60 * 1000),
      status: 'COMPLETED',
      creditsCharged: 2,
      topic: 'DSA & Backend Fundamentals',
      feedback: {
        summary: 'Good understanding of data structures. Needs improvement in time complexity analysis. Strong communication skills throughout.',
        overallRating: 'GOOD',
        technical: 'Solved 2 out of 3 problems correctly. Struggled with graph traversal but recovered well.',
        communication: 'Clear explanations and good thought process verbalization.',
        problemSolving: 'Methodical approach, could improve on edge case handling.',
        strengths: ['Clear communication', 'Strong array/string fundamentals', 'Good problem breakdown'],
        improvements: ['Graph algorithms', 'Time complexity analysis', 'Edge case handling'],
      },
    },
    {
      intervieweeId: interviewees[0]._id,
      interviewerId: interviewers[3]._id,
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15.75 * 60 * 60 * 1000),
      status: 'COMPLETED',
      creditsCharged: 4,
      topic: 'Behavioral Interview Practice',
      feedback: {
        summary: 'Excellent behavioral responses using STAR method. Natural leadership qualities visible. Ready for senior-level behavioral rounds.',
        overallRating: 'EXCELLENT',
        technical: 'N/A — behavioral focused session.',
        communication: 'Exceptional storytelling and structured answers.',
        problemSolving: 'Great examples of conflict resolution and ownership.',
        strengths: ['STAR method mastery', 'Authentic examples', 'Leadership mindset'],
        improvements: ['Could be more concise in some answers', 'Prepare more failure stories'],
      },
    },
    {
      intervieweeId: interviewees[2]._id,
      interviewerId: interviewers[4]._id,
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10.75 * 60 * 60 * 1000),
      status: 'CANCELLED',
      creditsCharged: 3,
      topic: 'Mobile Architecture Review',
    },
  ]);

  console.log(`Created ${bookings.length} bookings.`);

  console.log('\n✅ Seed complete! Here are the test accounts:\n');
  console.log('─── INTERVIEWEES (login to browse & book) ───');
  console.log('  Email: pushpendra@test.com  |  Password: password123');
  console.log('  Email: meera@test.com       |  Password: password123');
  console.log('  Email: arjun@test.com       |  Password: password123');
  console.log('\n─── INTERVIEWERS (login to see dashboard) ───');
  console.log('  Email: aarav@prept.com      |  Password: password123');
  console.log('  Email: priya@prept.com      |  Password: password123');
  console.log('  Email: rohit@prept.com      |  Password: password123');
  console.log('  Email: sneha@prept.com      |  Password: password123');
  console.log('  Email: karan@prept.com      |  Password: password123');
  console.log('  Email: ananya@prept.com     |  Password: password123');
  console.log('\nAll passwords: password123\n');

  await mongoose.disconnect();
  console.log('Done. Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
