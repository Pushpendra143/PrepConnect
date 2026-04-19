# PrepConnect (MERN Stack)

A full-stack interview scheduling platform built with **React**, **Express**, and **MongoDB**.

## Features
- JWT Authentication (Register / Login)
- Role-based onboarding (Interviewee or Interviewer)
- Browse interviewers with search & category filters
- Slot-based scheduling with credit system
- Interviewer dashboard with earnings, appointments & availability
- Responsive dark-themed UI

## Tech Stack
- **Frontend:** React (CRA), React Router, Axios, Tailwind CSS v4
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

## Setup

```bash
# 1. Backend
cd backend
npm install
node server.js

# 2. Frontend
cd frontend
npm install
npm start

# 3. Seed dummy data
cd backend
node seed.js
```

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Interviewee | pushpendra@test.com | password123 |
| Interviewer | aarav@prept.com | password123 |
