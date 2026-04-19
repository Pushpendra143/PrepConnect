import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from 'components/shared/PageHeader';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';
import { Calendar, Clock, Video, CalendarDays } from 'lucide-react';
import { formatDate, formatDuration, formatTime } from 'utils/helpers';
import { STATUS_STYLES, RATING_LABEL } from 'utils/constants';

function FeedbackBlock({ feedback }) {
  if (!feedback || !feedback.overallRating) return null;
  return (
    <div className="feedback-block">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1rem' }}>📊</span>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          AI Feedback — <span className="text-gold-gradient">{RATING_LABEL[feedback.overallRating] || feedback.overallRating}</span>
        </p>
      </div>
      {feedback.summary && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem', fontWeight: 300 }}>
          {feedback.summary}
        </p>
      )}
      {feedback.strengths?.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--green-400)', marginBottom: '0.25rem', fontWeight: 500 }}>Strengths</p>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {feedback.strengths.map((s) => (
              <li key={s} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green-400)' }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.improvements?.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gold-400)', marginBottom: '0.25rem', fontWeight: 500 }}>Areas to improve</p>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {feedback.improvements.map((s) => (
              <li key={s} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--gold-bg-subtle)', border: '1px solid var(--gold-border)', color: 'var(--gold-400)' }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ booking, userRole }) {
  const navigate = useNavigate();
  const mode = userRole === 'INTERVIEWER' ? 'interviewer' : 'interviewee';
  const { startTime, endTime, status, creditsCharged, feedback } = booking;

  const person = mode === 'interviewer' ? booking.intervieweeId : booking.interviewerId;
  const creditsLabel = mode === 'interviewer' ? `+${creditsCharged} credits earned` : `−${creditsCharged} credits`;
  const creditsClass = mode === 'interviewer' ? 'credits-earned' : 'credits-used';
  const isUpcoming = status === 'SCHEDULED' && new Date(startTime) > new Date();

  return (
    <article className="appointment-card">
      <div className="appointment-card-top">
        <div className="appointment-card-person">
          <Avatar className="appointment-card-avatar">
            <AvatarImage src={person?.imageUrl} alt={person?.name} style={{ borderRadius: 'var(--radius-2xl)' }} />
            <AvatarFallback className="appointment-card-avatar" style={{ borderRadius: 'var(--radius-2xl)', backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)', color: 'var(--gold-400)', fontSize: '1.125rem', fontWeight: 500 }}>
              {person?.name?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
            <p className="truncate" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>{person?.name ?? '—'}</p>
            {person?.title && person?.company ? (
              <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {person.title}<span style={{ color: 'var(--text-faint)', margin: '0 0.375rem' }}>·</span>{person.company}
              </p>
            ) : (
              <p className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{person?.email}</p>
            )}
          </div>
        </div>

        <div className="appointment-card-badges">
          <Badge variant="outline" className={STATUS_STYLES[status]}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
          <Badge variant="outline" className={creditsClass}>{creditsLabel}</Badge>
        </div>
      </div>

      <div className="appointment-card-divider" />

      <div className="appointment-card-details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div className="appointment-detail-label"><Calendar size={12} /><span>Date</span></div>
          <p className="appointment-detail-value">{formatDate(startTime)}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div className="appointment-detail-label"><Clock size={12} /><span>Time</span></div>
          <p className="appointment-detail-value">
            {formatTime(startTime)}<span style={{ color: 'var(--text-dim)', margin: '0 0.25rem' }}>–</span>{formatTime(endTime)}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div className="appointment-detail-label"><Video size={12} /><span>Duration</span></div>
          <p className="appointment-detail-value">{formatDuration(startTime, endTime)}</p>
        </div>
      </div>

      {isUpcoming && (
        <Button variant="gold" size="sm" className="w-full" style={{ marginTop: '0.5rem' }} onClick={() => navigate(`/call/${booking._id}`)}>
          <Video size={14} /> Join call →
        </Button>
      )}

      {status === 'COMPLETED' && feedback?.overallRating && (
        <FeedbackBlock feedback={feedback} />
      )}
    </article>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const now = new Date();
  const scheduled = bookings.filter((a) => a.status === 'SCHEDULED' && new Date(a.startTime) > now);
  const past = bookings.filter((a) => a.status !== 'SCHEDULED' || new Date(a.endTime) <= now);

  return (
    <main className="appointments-page">
      <PageHeader
        label="My appointments"
        gray="Your interview"
        gold="sessions"
        description="All your upcoming and past mock interviews in one place."
      />

      <div className="appointments-content">
        {loading && <p className="loading-text" style={{ textAlign: 'center', padding: '2.5rem 0' }}>Loading…</p>}

        {!loading && bookings.length === 0 && (
          <div className="appointments-empty">
            <span className="appointments-empty-icon">
              <CalendarDays size={28} style={{ color: 'var(--gold-400)' }} />
            </span>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 300 }}>No sessions booked yet.</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Browse expert interviewers and book your first session.</p>
            </div>
            <Button variant="gold" asChild>
              <Link to="/explore">Browse interviewers →</Link>
            </Button>
          </div>
        )}

        {scheduled.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="appointments-section-title">
              <p className="appointments-section-label">Upcoming ({scheduled.length})</p>
              <div className="appointments-section-line" />
            </div>
            <div className="appointments-grid">
              {scheduled.map((b) => <AppointmentCard key={b._id} booking={b} userRole={user?.role} />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="appointments-section-title">
              <p className="appointments-section-label">Past ({past.length})</p>
              <div className="appointments-section-line" />
            </div>
            <div className="appointments-grid">
              {past.map((b) => <AppointmentCard key={b._id} booking={b} userRole={user?.role} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
