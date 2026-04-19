import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from 'components/shared/PageHeader';
import { GoldTitle, GrayTitle } from 'components/shared/GradientText';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';
import { Separator } from 'components/ui/separator';
import { Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { CATEGORY_LABEL, EXPECT_ITEMS } from 'utils/constants';
import { formatTime, formatDateFull, generateDates, generateSlots } from 'utils/helpers';

export default function InterviewerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviewer, setInterviewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    API.get(`/users/interviewers/${id}`)
      .then((res) => {
        setInterviewer(res.data);
        setSelectedDate(new Date());
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="loading-screen">
        <p className="loading-text">Loading...</p>
      </main>
    );
  }

  if (!interviewer) {
    return (
      <main className="loading-screen">
        <p className="loading-text">Interviewer not found.</p>
      </main>
    );
  }

  const dates = generateDates(7);
  const slots =
    interviewer.availability && selectedDate
      ? generateSlots(
          selectedDate,
          interviewer.availability.startTime,
          interviewer.availability.endTime,
          interviewer.bookedSlots || [],
          45
        )
      : [];

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    setBooking(true);
    try {
      await API.post('/bookings', {
        interviewerId: interviewer._id || interviewer.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        topic: `Interview with ${interviewer.name}`,
      });
      setBooked(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <main className="booked-page">
        <div className="booked-container">
          <span className="booked-icon">
            <CheckCircle size={40} style={{ color: 'var(--green-400)' }} />
          </span>
          <h1 className="booked-title">
            <GrayTitle>Session </GrayTitle>
            <GoldTitle>booked!</GoldTitle>
          </h1>
          <p className="booked-text">
            Your interview with <strong style={{ color: 'var(--text-primary)' }}>{interviewer.name}</strong> has been scheduled for{' '}
            <strong style={{ color: 'var(--gold-400)' }}>{formatDateFull(selectedSlot.startTime)}</strong> at{' '}
            <strong style={{ color: 'var(--gold-400)' }}>{formatTime(selectedSlot.startTime)}</strong>.
          </p>
          <div className="booked-buttons">
            <Button variant="gold" onClick={() => navigate('/appointments')}>
              View appointments
            </Button>
            <Button variant="outline" onClick={() => navigate('/explore')}>
              Browse more
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <PageHeader
        label="Interviewer Profile"
        gray={interviewer.name}
        gold=""
        description={interviewer.title && interviewer.company ? `${interviewer.title} · ${interviewer.company}` : ''}
      />

      <div className="profile-content">
        <Button variant="ghost" className="profile-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} style={{ marginRight: '0.25rem' }} /> Back
        </Button>

        <div className="profile-layout">
          {/* LEFT — Profile Info */}
          <div className="profile-sidebar">
            <div className="profile-info-card">
              <Avatar className="profile-avatar">
                <AvatarImage src={interviewer.imageUrl} alt={interviewer.name} />
                <AvatarFallback>
                  {interviewer.name?.[0] ?? '?'}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>{interviewer.name}</h2>
                {interviewer.title && interviewer.company && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{interviewer.title} · {interviewer.company}</p>
                )}
              </div>

              <div className="profile-badges">
                {interviewer.yearsExp && (
                  <Badge variant="outline" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                    {interviewer.yearsExp}+ years
                  </Badge>
                )}
                <Badge variant="outline" style={{ borderColor: 'var(--gold-border)', color: 'var(--gold-400)', backgroundColor: 'var(--gold-bg-subtle)' }}>
                  {interviewer.creditRate ?? 1} credits/session
                </Badge>
              </div>

              <Separator />

              {interviewer.bio && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.625, textAlign: 'left' }}>{interviewer.bio}</p>
              )}

              {interviewer.categories?.length > 0 && (
                <div className="profile-categories">
                  {interviewer.categories.map((cat) => (
                    <span key={cat} className="category-tag">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What to expect */}
            <div className="profile-expect">
              <h3>What to expect</h3>
              <ul>
                {EXPECT_ITEMS.map(([emoji, title, desc]) => (
                  <li key={title}>
                    <span className="profile-expect-emoji">{emoji}</span>
                    <div>
                      <p className="profile-expect-title">{title}</p>
                      <p className="profile-expect-desc">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT — Slot Picker & Booking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="slot-picker">
              <h3>
                <Calendar size={18} />
                Pick a date &amp; time
              </h3>

              {!interviewer.availability ? (
                <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                  <p className="loading-text">This interviewer hasn't set their availability yet.</p>
                </div>
              ) : (
                <>
                  {/* Date tabs */}
                  <div className="date-tabs">
                    {dates.map((d) => {
                      const isActive = selectedDate && d.toDateString() === selectedDate.toDateString();
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = d.getDate();
                      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                      return (
                        <button
                          key={d.toISOString()}
                          onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                          className={`date-tab ${isActive ? 'active' : ''}`}
                        >
                          <span className="date-tab-day">{dayName}</span>
                          <span className="date-tab-num">{dayNum}</span>
                          <span>{monthName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  {slots.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No available slots for this date.</p>
                  ) : (
                    <div className="time-slots">
                      {slots.map((slot, i) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={i}
                            disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`time-slot ${isSelected ? 'active' : ''}`}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Confirm Card */}
            {selectedSlot && (
              <div className="confirm-card">
                <h3>Confirm your session</h3>

                <div className="confirm-details">
                  <div>
                    <span className="confirm-detail-label">Date</span>
                    <p className="confirm-detail-value">{formatDateFull(selectedSlot.startTime)}</p>
                  </div>
                  <div>
                    <span className="confirm-detail-label">Time</span>
                    <p className="confirm-detail-value">
                      {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                    </p>
                  </div>
                  <div>
                    <span className="confirm-detail-label">Interviewer</span>
                    <p className="confirm-detail-value">{interviewer.name}</p>
                  </div>
                  <div>
                    <span className="confirm-detail-label">Cost</span>
                    <p className="font-serif text-gold-gradient" style={{ fontSize: '0.875rem' }}>
                      {interviewer.creditRate ?? 1} credits
                    </p>
                  </div>
                </div>

                {!user ? (
                  <Button variant="gold" className="w-full" onClick={() => navigate('/login')}>
                    Sign in to book →
                  </Button>
                ) : (
                  <Button variant="gold" className="w-full" disabled={booking} onClick={handleBook}>
                    {booking ? 'Booking...' : `Confirm & Book (${interviewer.creditRate ?? 1} credits) →`}
                  </Button>
                )}

                <p className="confirm-balance">
                  Your current balance: <span>{user?.credits ?? 0} credits</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
