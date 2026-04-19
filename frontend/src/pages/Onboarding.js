import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { GoldTitle, GrayTitle, SectionLabel } from 'components/shared/GradientText';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { CATEGORIES, ONBOARDING_ROLES, YEARS_OPTIONS } from 'utils/constants';

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    yearsExp: '',
    bio: '',
    categories: [],
  });

  // if user already has a role, redirect them
  useEffect(() => {
    if (user && user.role !== 'UNASSIGNED') {
      navigate(user.role === 'INTERVIEWER' ? '/dashboard' : '/explore');
    }
  }, [user, navigate]);

  const toggleCategory = (val) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(val)
        ? prev.categories.filter((c) => c !== val)
        : [...prev.categories, val],
    }));
  };

  const isInterviewerValid =
    form.title.trim() &&
    form.company.trim() &&
    form.yearsExp &&
    form.bio.trim() &&
    form.categories.length > 0;

  const canSubmit =
    role === 'INTERVIEWEE' || (role === 'INTERVIEWER' && isInterviewerValid);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      const payload = {
        role,
        ...(role === 'INTERVIEWER' && {
          title: form.title,
          company: form.company,
          yearsExp: Number(form.yearsExp),
          bio: form.bio,
          categories: form.categories,
        }),
      };

      const res = await API.put('/users/onboarding', payload);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      updateUser(res.data.user);

      navigate(role === 'INTERVIEWER' ? '/dashboard' : '/explore');
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="onboarding-page">
      <div className="onboarding-container">
        {/* Heading */}
        <div className="onboarding-heading">
          <SectionLabel>Welcome</SectionLabel>
          <h1>
            <GrayTitle>How will you be</GrayTitle>
            <br />
            <GoldTitle>using Prept?</GoldTitle>
          </h1>
          <p>
            This helps us personalise your experience.
            <span style={{ color: 'var(--text-dim)' }}> You can't change this later.</span>
          </p>
        </div>

        {!role && (
          <div className="onboarding-roles-grid">
            {ONBOARDING_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className="onboarding-role-btn"
              >
                <span className="bento-card-icon">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </button>
            ))}
          </div>
        )}

        {role && (
          <div className="onboarding-form">
            {/* role strip */}
            <div className="onboarding-strip">
              <div className="onboarding-strip-info">
                <span className="onboarding-strip-icon">
                  {ONBOARDING_ROLES.find((r) => r.value === role)?.icon}
                </span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {ONBOARDING_ROLES.find((r) => r.value === role)?.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.125rem' }}>Selected role</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setRole(null)}>
                Change
              </Button>
            </div>

            {/* interviewer form */}
            {role === 'INTERVIEWER' && (
              <div className="onboarding-form-card">
                <div className="onboarding-grid-2">
                  <div className="auth-field">
                    <label className="form-label">Current title</label>
                    <Input
                      placeholder="Senior Software Engineer"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="form-label">Company</label>
                    <Input
                      placeholder="Google, Meta, Startup…"
                      value={form.company}
                      onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    />
                  </div>
                </div>

                {/* years */}
                <div className="onboarding-pills">
                  {YEARS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, yearsExp: opt.value }))}
                      className={`pill-toggle ${form.yearsExp === opt.value ? 'active' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* categories */}
                <div className="onboarding-pills">
                  {CATEGORIES.map((cat) => {
                    if (!cat?.value) return null;
                    const active = form.categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`pill-toggle ${active ? 'active' : ''}`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* bio */}
                <textarea
                  rows={4}
                  maxLength={300}
                  placeholder="Tell interviewees about your background, what you specialise in…"
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="textarea"
                />
              </div>
            )}

            <Button
              variant="gold"
              className="w-full"
              style={{ padding: '1rem', fontSize: '1rem' }}
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading
                ? 'Setting up your account…'
                : role === 'INTERVIEWER'
                ? 'Create interviewer profile →'
                : 'Go to dashboard →'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
