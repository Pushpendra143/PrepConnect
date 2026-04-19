import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import PageHeader from 'components/shared/PageHeader';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Badge } from 'components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';
import {
  Clock, ClipboardList, Wallet, Calendar, Video,
  ArrowDownCircle, Bot
} from 'lucide-react';
import { formatDate, formatDuration, formatTime } from 'utils/helpers';
import { STATUS_STYLES } from 'utils/constants';

function AvailabilitySection({ initial }) {
  const [startTime, setStartTime] = useState(
    initial?.startTime ? new Date(initial.startTime).toISOString().slice(0, 16) : ''
  );
  const [endTime, setEndTime] = useState(
    initial?.endTime ? new Date(initial.endTime).toISOString().slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSave = async () => {
    if (!startTime || !endTime) {
      setIsError(true);
      setMessage('Please set both start and end time');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setIsError(true);
      setMessage('Start time must be before end time');
      return;
    }
    setSaving(true);
    setMessage('');
    setIsError(false);
    try {
      await API.post('/availability', { startTime, endTime });
      setMessage('Availability saved!');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-availability">
      <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Set Your Availability
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 300, marginBottom: '1.25rem' }}>
        Set your daily window. Interviewees pick 45-minute slots within this range.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="auth-field">
          <label className="form-label">From</label>
          <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="auth-field">
          <label className="form-label">To</label>
          <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>
      {message && (
        <p style={{ fontSize: '0.875rem', color: isError ? 'var(--red-400)' : 'var(--green-400)' }}>{message}</p>
      )}
      <Button variant="gold" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save availability'}
      </Button>
    </div>
  );
}

function WithdrawalSection({ creditBalance, onWithdrawSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const res = await API.get('/withdrawals');
      setWithdrawals(res.data);
    } catch (err) {
      console.error('Withdrawals load error:', err);
    }
  }

  async function handleWithdraw() {
    if (!amount || Number(amount) <= 0) { setIsError(true); setMessage('Enter a valid amount'); return; }
    if (Number(amount) > creditBalance) { setIsError(true); setMessage('Insufficient balance'); return; }
    if (!accountDetails.trim()) { setIsError(true); setMessage('Account details required'); return; }
    setSubmitting(true); setMessage(''); setIsError(false);
    try {
      await API.post('/withdrawals', { amount: Number(amount), method, accountDetails: accountDetails.trim() });
      setMessage('Withdrawal request submitted! Processing within 3 business days.');
      setAmount(''); setAccountDetails('');
      onWithdrawSuccess && onWithdrawSuccess(Number(amount));
      loadHistory();
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  }

  const STATUS_COLOR = { PENDING: 'status-scheduled', PROCESSING: 'status-scheduled', COMPLETED: 'status-completed', REJECTED: 'status-cancelled' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="dashboard-availability">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Request Withdrawal
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 300, marginBottom: '1.25rem' }}>
          Available: <span className="text-gold-gradient" style={{ fontWeight: 600 }}>{creditBalance} credits</span>
        </p>
        <div className="auth-field">
          <label className="form-label">Amount (credits)</label>
          <Input type="number" placeholder="e.g. 10" min={1} max={creditBalance} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Payment method</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['UPI', 'BANK_TRANSFER', 'PAYPAL'].map((m) => (
              <button key={m} type="button" onClick={() => setMethod(m)} className={`pill-toggle ${method === m ? 'active' : ''}`}>
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="auth-field">
          <label className="form-label">
            {method === 'UPI' ? 'UPI ID' : method === 'PAYPAL' ? 'PayPal email' : 'Bank details'}
          </label>
          <Input placeholder={method === 'UPI' ? 'yourname@upi' : method === 'PAYPAL' ? 'you@example.com' : 'Account no, IFSC…'} value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} />
        </div>
        {message && <p style={{ fontSize: '0.875rem', color: isError ? 'var(--red-400)' : 'var(--green-400)' }}>{message}</p>}
        <Button variant="gold" onClick={handleWithdraw} disabled={submitting || creditBalance === 0}>
          {submitting ? 'Submitting…' : 'Request withdrawal →'}
        </Button>
      </div>
      {withdrawals.length > 0 && (
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Withdrawal history</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {withdrawals.map((w) => (
              <div key={w._id} className="dashboard-appointment-row">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{w.amount} credits via {w.method.replace('_', ' ')}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.125rem' }}>{new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_COLOR[w.status]}>{w.status.charAt(0) + w.status.slice(1).toLowerCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ booking }) {
  const navigate = useNavigate();
  const person = booking.intervieweeId;
  const isUpcoming = booking.status === 'SCHEDULED';

  return (
    <article className="dashboard-appointment-row">
      <div className="dashboard-appointment-top">
        <div className="dashboard-appointment-person">
          <Avatar style={{ width: '2.5rem', height: '2.5rem', border: '1px solid var(--border-default)' }}>
            <AvatarImage src={person?.imageUrl} alt={person?.name} />
            <AvatarFallback style={{ backgroundColor: 'var(--gold-bg)', color: 'var(--gold-400)', fontSize: '0.875rem' }}>
              {person?.name?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{person?.name ?? '—'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="outline" className={STATUS_STYLES[booking.status]}>
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </Badge>
          {isUpcoming && (
            <Button variant="gold" size="sm" onClick={() => navigate(`/call/${booking._id}`)} style={{ gap: '0.25rem' }}>
              <Video size={12} /> Join
            </Button>
          )}
        </div>
      </div>
      <div className="dashboard-appointment-details">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={12} /> {formatDate(booking.startTime)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={12} /> {formatTime(booking.startTime)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Video size={12} /> {formatDuration(booking.startTime, booking.endTime)}</div>
      </div>
      {booking.topic && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Topic: {booking.topic}</p>}
    </article>
  );
}

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('earnings');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'INTERVIEWER') { navigate('/explore'); return; }
    loadAll();
  }, [user, navigate]);

  async function loadAll() {
    try {
      const [statsRes, bookingsRes, availRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/bookings'),
        API.get('/availability/me'),
      ]);
      setStats(statsRes.data);
      setAppointments(bookingsRes.data);
      setAvailability(availRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleWithdrawSuccess(amount) {
    setStats((s) => s ? { ...s, creditBalance: s.creditBalance - amount } : s);
  }

  if (loading) {
    return <main className="loading-screen"><p className="loading-text">Loading dashboard…</p></main>;
  }

  const tabs = [
    { id: 'earnings', label: 'Earnings', icon: <Wallet size={16} style={{ color: 'var(--gold-400)' }} /> },
    { id: 'appointments', label: 'Appointments', icon: <ClipboardList size={18} style={{ color: 'var(--gold-400)' }} /> },
    { id: 'availability', label: 'Availability', icon: <Clock size={18} style={{ color: 'var(--gold-400)' }} /> },
    { id: 'withdrawal', label: 'Withdraw', icon: <ArrowDownCircle size={18} style={{ color: 'var(--gold-400)' }} /> },
    { id: 'ai', label: 'AI Questions', icon: <Bot size={18} style={{ color: 'var(--gold-400)' }} /> },
  ];

  return (
    <main className="dashboard-page">
      <PageHeader
        label="Interviewer dashboard"
        gray="Welcome back,"
        gold={user?.name?.split(' ')[0] ?? 'Interviewer'}
        description={user?.title && user?.company ? `${user.title} · ${user.company}` : undefined}
        right={
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Credit balance</p>
            <p className="font-serif text-gold-gradient" style={{ fontSize: '1.875rem', lineHeight: 1, textAlign: 'right' }}>
              {stats?.creditBalance ?? 0}
            </p>
          </div>
        }
      />

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'earnings' && (
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <p className="dashboard-stat-label">Credit Balance</p>
              <p className="dashboard-stat-value text-gold-gradient">{stats?.creditBalance ?? 0}</p>
            </div>
            <div className="dashboard-stat-card">
              <p className="dashboard-stat-label">Total Earned</p>
              <p className="dashboard-stat-value" style={{ color: 'var(--text-primary)' }}>{stats?.totalEarned ?? 0}</p>
            </div>
            <div className="dashboard-stat-card">
              <p className="dashboard-stat-label">Completed Sessions</p>
              <p className="dashboard-stat-value" style={{ color: 'var(--text-primary)' }}>{stats?.completedSessions ?? 0}</p>
            </div>
            <div className="dashboard-stat-card">
              <p className="dashboard-stat-label">Upcoming</p>
              <p className="dashboard-stat-value" style={{ color: 'var(--text-primary)' }}>{stats?.scheduledSessions ?? 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.length === 0
              ? <p className="loading-text" style={{ textAlign: 'center', padding: '2.5rem 0' }}>No appointments yet.</p>
              : appointments.map((b) => <AppointmentRow key={b._id} booking={b} />)
            }
          </div>
        )}

        {activeTab === 'availability' && <AvailabilitySection initial={availability} />}

        {activeTab === 'withdrawal' && (
          <WithdrawalSection creditBalance={stats?.creditBalance ?? 0} onWithdrawSuccess={handleWithdrawSuccess} />
        )}

        {activeTab === 'ai' && (
          <div className="dashboard-availability">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>AI Question Generator</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 300, marginBottom: '1.25rem' }}>
              Generate role-specific questions for your upcoming sessions.
            </p>
            <Button variant="gold" asChild>
              <Link to="/ai-questions">Open AI Questions →</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
