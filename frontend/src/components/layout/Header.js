import React from 'react';
import { Button } from 'components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="header-nav">
      <Link to="/">
        <img
          src="/logo.png"
          alt="Prept Logo"
          width={100}
          height={100}
          className="header-logo"
        />
      </Link>

      <div className="header-actions">
        {!user ? (
          <>
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button variant="gold">Get started →</Button>
            </Link>
          </>
        ) : (
          <>
            {user.role === 'INTERVIEWER' && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/ai-questions">
                    <Bot size={16} />
                    <span className="header-nav-text">AI Questions</span>
                  </Link>
                </Button>
              </>
            )}

            {user.role === 'INTERVIEWEE' && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/explore">
                    <Users size={16} />
                    <span className="header-nav-text">Explore</span>
                  </Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/appointments">
                    <CalendarDays size={16} />
                    <span className="header-nav-text">My Appointments</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Credit display */}
            <div className="header-credits">
              <span>
                {user.role === 'INTERVIEWER' ? user.creditBalance ?? 0 : user.credits ?? 0} credits
              </span>
            </div>

            {/* User avatar with name initial */}
            <div className="header-user">
              <div className="header-avatar">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <button
                onClick={logout}
                className="header-logout"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
