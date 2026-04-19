import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { GoldTitle, GrayTitle, SectionLabel } from 'components/shared/GradientText';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      if (data.user.role === 'UNASSIGNED') {
        navigate('/onboarding');
      } else if (data.user.role === 'INTERVIEWER') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-heading">
          <SectionLabel>Welcome back</SectionLabel>
          <h1>
            <GrayTitle>Sign in to </GrayTitle>
            <GoldTitle>Prept</GoldTitle>
          </h1>
        </div>

        <div className="auth-card">
          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="form-label">Email</label>
              <Input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="form-label">Password</label>
              <Input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button variant="gold" className="w-full" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </Button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
