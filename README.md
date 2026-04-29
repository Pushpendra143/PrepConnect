# PrepConnect (MERN Stack)

PrepConnect is a comprehensive full-stack interview scheduling platform designed to bridge the gap between candidates (Interviewees) and experts (Interviewers). It features a robust credit-based booking system, real-time-ready call rooms, and AI-driven interview preparation tools.

## 🚀 Key Features
- **Dual-Role Ecosystem**: Tailored experiences for both Interviewees and Interviewers.
- **Secure Authentication**: JWT-based login/register with role-based access control.
- **Credit System**: Integrated credit-based economy for booking sessions.
- **Explore & Filter**: Advanced search for finding the right experts by category and experience.
- **Call Room**: Browser-native video calling interface with screen sharing and AI assistants.
- **AI Questions**: On-demand interview question generation for various technical domains.

## 🛠️ Tech Stack & Concepts

### Frontend (React)
- **State & Hooks**: Managed via `useState`, `useEffect`, and `useContext`.
- **Navigation**: Client-side routing with `react-router-dom`.
- **UI/UX**: Responsive design with Tailwind CSS v4 and Framer Motion animations.
- **API Client**: `Axios` for seamless backend communication.

### Backend (Node.js & Express)
- **Architecture**: Modular REST API design.
- **Security**: JWT authentication and password hashing with `bcryptjs`.
- **Database**: MongoDB with `Mongoose` for object data modeling.

## 📁 Project Structure

### Backend
- `/models`: Database schemas (User, Booking).
- `/routes`: API endpoints (Auth, Bookings, AI, Dashboard).
- `/middleware`: Authentication and error handling logic.

### Frontend
- `/pages`: Main view components (Explore, Dashboard, CallRoom).
- `/components`: Reusable UI elements (Header, Buttons, Cards).
- `/context`: Global state management for authentication.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB instance (local or Atlas)

### Step 1: Backend
```bash
cd backend
npm install
# Create a .env file with MONGO_URI and JWT_SECRET
node server.js
```

### Step 2: Frontend
```bash
cd frontend
npm install
npm start
```

### Step 3: Seed Data (Optional)
```bash
cd backend
node seed.js # Populates database with test accounts
```

## 🧪 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Interviewee | pushpendra@test.com | password123 |
| Interviewer | aarav@prept.com | password123 |

---

*This project is built as a real-world demonstration of modern full-stack development patterns.*
