import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import PageHeader from 'components/shared/PageHeader';
import { Input } from 'components/ui/input';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';
import { Separator } from 'components/ui/separator';
import { Search } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABEL } from 'utils/constants';
import { formatTime } from 'utils/helpers';

function InterviewerCard({ interviewer }) {
  const {
    id, _id, name, imageUrl, title, company, yearsExp,
    bio, categories, creditRate, availabilities,
  } = interviewer;
  const interviewerId = id || _id;
  const availability = availabilities?.[0];

  return (
    <div className="interviewer-card">
      <div className="interviewer-card-gradient" />
      <div className="interviewer-card-top">
        <div className="interviewer-card-info">
          <Avatar style={{ width: '2.75rem', height: '2.75rem', border: '1px solid var(--border-default)', flexShrink: 0 }}>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback style={{ backgroundColor: 'var(--gold-bg)', border: '1px solid var(--gold-border)', color: 'var(--gold-400)', fontSize: '0.875rem', fontWeight: 500 }}>
              {name?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>{name}</p>
            {title && company && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{title} · {company}</p>
            )}
          </div>
        </div>
        {yearsExp && (
          <Badge variant="outline" style={{ flexShrink: 0, borderColor: 'var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {yearsExp}+ yrs
          </Badge>
        )}
      </div>

      {bio && (
        <p className="line-clamp-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.625 }}>{bio}</p>
      )}

      {categories?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {categories.slice(0, 4).map((cat) => (
            <span key={cat} className="category-tag">
              {CATEGORY_LABEL[cat] ?? cat}
            </span>
          ))}
        </div>
      )}

      <Separator />

      <div className="interviewer-card-bottom">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p className="interviewer-card-rate text-gold-gradient">
            {creditRate ?? 1}
            <span>credits / session</span>
          </p>
          {availability ? (
            <p className="interviewer-card-avail">
              🟢 {formatTime(availability.startTime)} – {formatTime(availability.endTime)}
            </p>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>No availability set</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="view-profile-btn" asChild>
          <Link to={`/interviewers/${interviewerId}`}>View profile →</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [interviewers, setInterviewers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/users/interviewers')
      .then((res) => setInterviewers(res.data))
      .catch((err) => console.error('Failed to load interviewers:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return interviewers.filter((i) => {
      const matchesCategory = activeCategory === null || i.categories?.includes(activeCategory);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        i.name?.toLowerCase().includes(q) ||
        i.title?.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [interviewers, activeCategory, search]);

  return (
    <main className="explore-page">
      <PageHeader
        label="Explore"
        gray="Find your"
        gold="expert interviewer"
        description="Browse senior engineers from top companies."
      />

      <div className="explore-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Filters */}
          <div className="explore-filters">
            <div className="explore-search-wrap">
              <Search size={14} className="explore-search-icon" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, title or company…"
                className="explore-search-input"
              />
            </div>

            <div className="explore-categories">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.value;
                return (
                  <button
                    key={String(cat.value)}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className={`pill-toggle ${active ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          <p className="explore-count">
            {loading ? 'Loading...' : filtered.length === 0
              ? 'No interviewers found'
              : `${filtered.length} interviewer${filtered.length === 1 ? '' : 's'} found`}
          </p>

          {/* Grid */}
          {filtered.length === 0 && !loading ? (
            <div className="explore-empty">
              <p>No interviewers match your filters.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory(null); setSearch(''); }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="explore-grid">
              {filtered.map((interviewer) => (
                <InterviewerCard key={interviewer._id || interviewer.id} interviewer={interviewer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
