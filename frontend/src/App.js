import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import OnboardingPage from './pages/Onboarding';
import ExplorePage from './pages/Explore';
import AppointmentsPage from './pages/Appointments';
import DashboardPage from './pages/Dashboard';
import InterviewerProfilePage from './pages/InterviewerProfile';
import CallRoomPage from './pages/CallRoom';
import AIQuestionsPage from './pages/AIQuestions';

// Protected route — redirects to login if no user
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Routes that should redirect away if already logged in (login, register)
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Loading…</p>
      </div>
    );
  }
  if (user) {
    if (user.role === 'UNASSIGNED') return <Navigate to="/onboarding" replace />;
    if (user.role === 'INTERVIEWER') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/explore" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <div className="content-offset">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Auth required */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
          <Route path="/interviewers/:id" element={<ProtectedRoute><InterviewerProfilePage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/call/:bookingId" element={<ProtectedRoute><CallRoomPage /></ProtectedRoute>} />
          <Route path="/ai-questions" element={<ProtectedRoute><AIQuestionsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-wrapper">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
