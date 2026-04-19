import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import PageHeader from 'components/shared/PageHeader';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Bot, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES, YEARS_OPTIONS } from 'utils/constants';

const LEVELS = [
  { value: 'junior', label: 'Junior (0–2 yrs)' },
  { value: 'mid', label: 'Mid (2–5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' },
  { value: 'staff', label: 'Staff / Principal' },
];

function QuestionCard({ question }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ai-question-card">
      <button
        className="ai-question-header"
        onClick={() => setOpen(!open)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, textAlign: 'left' }}>
          <span className="ai-question-number">{question.id}</span>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 400 }}>
            {question.question}
          </p>
        </div>
        <span style={{ flexShrink: 0, color: 'var(--text-dim)' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="ai-question-body">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="outline" style={{ borderColor: 'var(--gold-border)', color: 'var(--gold-400)', fontSize: '0.7rem' }}>
              {question.category?.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {question.difficulty} level
            </Badge>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Use this question in your interview. Tailor the depth based on the candidate's experience level.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AIQuestionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('FRONTEND');
  const [level, setLevel] = useState('mid');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const filteredCategories = CATEGORIES.filter((c) => c.value !== null);

  async function generateQuestions() {
    setLoading(true);
    setGenerated(false);
    try {
      const res = await API.post('/ai/questions', { category, level });
      setQuestions(res.data.questions);
      setGenerated(true);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ai-questions-page">
      <PageHeader
        label="AI Question Generator"
        gray="Generate role-specific"
        gold="interview questions"
        description="Pick a category and level — the AI generates 6 tailored questions instantly."
      />

      <div className="ai-questions-content">
        {/* Config panel */}
        <div className="ai-questions-config">
          <div>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>Category</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {filteredCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`pill-toggle ${category === cat.value ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>Candidate level</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={`pill-toggle ${level === l.value ? 'active' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gold"
            onClick={generateQuestions}
            disabled={loading}
            style={{ alignSelf: 'flex-start', gap: '0.5rem' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating…
              </>
            ) : (
              <>
                <Bot size={16} />
                Generate questions →
              </>
            )}
          </Button>
        </div>

        {/* Questions list */}
        {generated && (
          <div className="ai-questions-list">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {questions.length} questions generated for{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {category.replace('_', ' ')} · {level}
                </strong>
              </p>
              <Button variant="outline" size="sm" onClick={generateQuestions}>
                <RefreshCw size={12} /> Refresh
              </Button>
            </div>

            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}

        {!generated && !loading && (
          <div className="ai-questions-empty">
            <span style={{ fontSize: '3rem' }}>🤖</span>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Select a category and level, then click "Generate questions"
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Questions are tailored to the selected category and experience level
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
