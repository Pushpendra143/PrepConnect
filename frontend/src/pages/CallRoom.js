import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { Button } from 'components/ui/button';
import { GoldTitle, GrayTitle } from 'components/shared/GradientText';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Monitor, MonitorOff, MessageSquare, Bot, Users
} from 'lucide-react';
import { formatTime } from 'utils/helpers';

export default function CallRoomPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callToken, setCallToken] = useState(null);
  const [callId, setCallId] = useState(null);

  // call controls state
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadBookingAndToken();
  }, [bookingId, user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopLocalStream();
    };
  }, []);

  async function loadBookingAndToken() {
    try {
      const [bookingRes, tokenRes] = await Promise.all([
        API.get(`/bookings/${bookingId}`),
        API.post('/calls/token', { bookingId }),
      ]);
      setBooking(bookingRes.data);
      setCallToken(tokenRes.data.token);
      setCallId(tokenRes.data.callId);
    } catch (err) {
      console.error('Failed to load call room:', err);
    } finally {
      setLoading(false);
    }
  }

  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallStarted(true);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error('Could not access camera/mic:', err);
      alert('Please allow camera and microphone access to join the call.');
    }
  }

  function stopLocalStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }

  function toggleMic() {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  }

  function toggleCamera() {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  }

  async function toggleScreenShare() {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.getVideoTracks()[0].onended = () => setScreenSharing(false);
        setScreenSharing(true);
      } else {
        setScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }

  async function endCall() {
    if (timerRef.current) clearInterval(timerRef.current);
    stopLocalStream();

    if (user.role === 'INTERVIEWER') {
      try {
        await API.put(`/bookings/${bookingId}/complete`);
      } catch (err) {
        console.error('Could not mark booking complete:', err);
      }
    }

    navigate('/appointments');
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <p className="loading-text">Setting up your call room...</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="loading-screen">
        <p className="loading-text">Booking not found.</p>
        <Button variant="outline" onClick={() => navigate('/appointments')} style={{ marginTop: '1rem' }}>
          Back to Appointments
        </Button>
      </main>
    );
  }

  const partner = user.role === 'INTERVIEWER' ? booking.intervieweeId : booking.interviewerId;

  return (
    <main className="call-room-page">
      {!callStarted ? (
        /* Pre-call lobby */
        <div className="call-lobby">
          <div className="call-lobby-card">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🎥</span>
              <h1 style={{ marginTop: '1rem' }}>
                <GrayTitle>Ready to join </GrayTitle>
                <GoldTitle>the call?</GoldTitle>
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Session with <strong style={{ color: 'var(--text-primary)' }}>{partner?.name}</strong>
              </p>
              {booking.topic && (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Topic: {booking.topic}
                </p>
              )}
            </div>

            <div className="call-lobby-info">
              <div className="call-lobby-info-row">
                <span>Call ID</span>
                <code style={{ color: 'var(--gold-400)', fontSize: '0.75rem' }}>{callId}</code>
              </div>
              <div className="call-lobby-info-row">
                <span>Start time</span>
                <span>{formatTime(booking.startTime)}</span>
              </div>
              <div className="call-lobby-info-row">
                <span>Duration</span>
                <span>45 minutes</span>
              </div>
            </div>

            <p className="call-lobby-note">
              This is a demo call room. In production, connect your Stream API key and secret in{' '}
              <code style={{ color: 'var(--gold-400)' }}>.env</code> to enable live video.
            </p>

            <Button variant="gold" className="w-full" style={{ padding: '0.875rem' }} onClick={startCall}>
              Join call →
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* Active call */
        <div className="call-active">
          {/* Header bar */}
          <div className="call-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="call-live-dot" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                {formatDuration(callDuration)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Session with {partner?.name}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user.role === 'INTERVIEWER' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                  style={{ gap: '0.375rem' }}
                >
                  <Bot size={14} /> AI Questions
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                style={{ gap: '0.375rem' }}
              >
                <MessageSquare size={14} /> Chat
              </Button>
            </div>
          </div>

          {/* Main video area */}
          <div className="call-videos">
            <div className="call-video-main">
              <div className="call-video-placeholder">
                <Users size={48} style={{ color: 'var(--text-dim)' }} />
                <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {partner?.name}
                </p>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Connect Stream SDK to show live video
                </p>
              </div>
            </div>

            <div className="call-video-self">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
              />
              {!cameraOn && (
                <div className="call-video-off-overlay">
                  <VideoOff size={20} style={{ color: 'var(--text-dim)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Side panels */}
          <div className="call-panels">
            {showAI && user.role === 'INTERVIEWER' && (
              <AIQuestionsPanel bookingId={bookingId} booking={booking} />
            )}
            {showChat && (
              <CallChatPanel bookingId={bookingId} user={user} partner={partner} />
            )}
          </div>

          {/* Controls bar */}
          <div className="call-controls">
            <button
              onClick={toggleMic}
              className={`call-control-btn ${!micOn ? 'call-control-off' : ''}`}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`call-control-btn ${!cameraOn ? 'call-control-off' : ''}`}
              title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`call-control-btn ${screenSharing ? 'call-control-active' : ''}`}
              title={screenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            </button>

            <button
              onClick={endCall}
              className="call-control-btn call-control-end"
              title="End call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// AI Questions panel embedded in the call
function AIQuestionsPanel({ bookingId, booking }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('FRONTEND');

  const categories = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'DEVOPS', 'MOBILE'];

  async function generateQuestions() {
    setLoading(true);
    try {
      const res = await API.post('/ai/questions', { category, level: 'mid' });
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="call-side-panel">
      <div className="call-side-panel-header">
        <Bot size={16} style={{ color: 'var(--gold-400)' }} />
        <h3>AI Questions</h3>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`pill-toggle ${category === cat ? 'active' : ''}`}
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Button variant="gold" size="sm" onClick={generateQuestions} disabled={loading} className="w-full">
        {loading ? 'Generating...' : 'Generate questions →'}
      </Button>

      {questions.length > 0 && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.map((q) => (
            <li key={q.id} style={{ padding: '0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--gold-400)', marginRight: '0.25rem' }}>Q{q.id}.</strong>
                {q.question}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Basic in-call chat panel
function CallChatPanel({ bookingId, user, partner }) {
  const [messages, setMessages] = useState([
    { id: 1, from: 'system', text: 'Chat is active. Messages are visible only during this session.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text: input.trim() }]);
    setInput('');
  }

  return (
    <div className="call-side-panel">
      <div className="call-side-panel-header">
        <MessageSquare size={16} style={{ color: 'var(--gold-400)' }} />
        <h3>Chat</h3>
      </div>

      <div className="call-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`call-chat-msg ${m.from === 'me' ? 'call-chat-msg-me' : m.from === 'system' ? 'call-chat-msg-system' : 'call-chat-msg-other'}`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="call-chat-input-row">
        <input
          className="input"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, height: '2rem', fontSize: '0.8rem' }}
        />
        <Button variant="gold" size="sm" onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
