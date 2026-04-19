import { CodeDemo } from "components/home/CodeDemo";
import { StarsBackground } from "components/home/StarsBackground";
import { AI_TAGS, AVATARS, LOGOS, ROLES, SLOTS } from "utils/constants";
import {
  GoldTitle,
  GrayTitle,
  SectionHeading,
  SectionLabel,
} from "components/shared/GradientText";
import { Bot, Wallet } from "lucide-react";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Link } from "react-router-dom";
import PricingSection from "components/home/PricingSection";

function MockUI({ rows = 3 }) {
  const widths = ['80%', '60%', '40%', '80%', '50%'];
  const colors = [
    'rgba(255,255,255,0.05)',
    'rgba(255,255,255,0.05)',
    'rgba(251,191,36,0.15)',
    'rgba(255,255,255,0.05)',
    'rgba(255,255,255,0.05)',
  ];

  return (
    <div className="mock-ui">
      <div className="mock-ui-titlebar">
        <span className="mock-ui-dot" style={{ backgroundColor: '#ff5f57' }} />
        <span className="mock-ui-dot" style={{ backgroundColor: '#ffbd2e' }} />
        <span className="mock-ui-dot" style={{ backgroundColor: '#28c840' }} />
      </div>
      <div className="mock-ui-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="mock-ui-line"
            style={{ width: widths[i], backgroundColor: colors[i] }}
          />
        ))}
      </div>
    </div>
  );
}

export function BentoCard({ icon, title, desc, children, className = "" }) {
  return (
    <div className={`bento-card ${className}`}>
      <div className="bento-card-gradient" />
      <span className="bento-card-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <StarsBackground starColor="#FFF" />

        {/* LEFT */}
        <div className="hero-left">
          <Badge variant="gold">Powered by AI — Now in Beta</Badge>

          <h1 className="hero-title">
            <GrayTitle>Ace your next interview</GrayTitle>
            <br />
            <GoldTitle>with real experts</GoldTitle>
          </h1>

          <p className="hero-subtitle">
            Book 1:1 mock interviews with senior engineers from top companies.
            Get AI-powered feedback, role-specific questions, and the confidence
            to land your dream job.
          </p>

          <div className="hero-cta">
            <Link to="/onboarding">
              <Button variant="gold" size="hero">
                Get started
              </Button>
            </Link>

            <Link to="/explore">
              <Button variant="outline" size="hero">
                Browse Interviewers →
              </Button>
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              {AVATARS.map((av, i) => (
                <div key={i} className="hero-avatar">
                  <img
                    src={av.src}
                    alt="user avatar"
                    width={32}
                    height={32}
                  />
                </div>
              ))}
            </div>

            <p className="hero-social-text">
              <strong className="hero-social-strong">
                2,400+ engineers
              </strong>{" "}
              cracked FAANG &amp; product interviews via Prept
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <CodeDemo duration={30000} writing />
        </div>
      </section>

      {/* LOGOS */}
      <section className="logo-section">
        <p>Interviewees landed roles at</p>
        <div className="logo-row">
          {LOGOS.map((l) => (
            <img
              key={l.alt}
              src={l.src}
              alt={l.alt}
              width={50}
              height={50}
              className="logo-img"
            />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-center">
          <SectionLabel>Features</SectionLabel>
          <SectionHeading
            gray="Everything you need,"
            gold="nothing you don't"
          />
        </div>

        <div className="features-grid">
          <div className="col-12 col-md-7">
            <BentoCard
              icon={<Bot size={20} style={{ color: 'var(--gold-400)' }} />}
              title={<GrayTitle>AI Question Generator</GrayTitle>}
              desc="Interviewers get a live AI co-pilot generating role-specific questions on demand — system design, behavioural, DSA — all tailored to the candidate's level."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                {AI_TAGS.map((t) => (
                  <Badge key={t.label} variant={t.active ? "gold" : "outline"}>
                    {t.label}
                  </Badge>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="col-12 col-md-5">
            <BentoCard
              icon={<Wallet size={16} style={{ color: 'var(--gold-400)' }} />}
              title={<GrayTitle>Credit System</GrayTitle>}
              desc="Subscribe for monthly credits. Book sessions. Interviewers earn and withdraw any time."
            >
              <div style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Your balance</p>
                  <p className="font-serif text-gold-gradient" style={{ fontSize: '2.25rem', lineHeight: 1 }}>28</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>credits remaining</p>
                </div>
                <Badge variant="secondary">+10 this month</Badge>
              </div>
            </BentoCard>
          </div>

          <div className="col-12 col-md-4">
            <BentoCard
              icon="📹"
              title="HD Video Calls"
              desc="Powered by Stream. Screen sharing, recording, and instant playback links — all built in."
            >
              <MockUI rows={3} />
            </BentoCard>
          </div>

          <div className="col-12 col-md-4">
            <BentoCard
              icon="💬"
              title="Persistent Chat"
              desc="Message your interviewer before and after the call. Share resources, prep notes, and follow-ups in one thread."
            />
          </div>

          <div className="col-12 col-md-4">
            <BentoCard
              icon="🔒"
              title="Security by Arcjet"
              desc="Bot protection, rate limiting, and abuse prevention baked into every API route."
            />
          </div>

          <div className="col-12 col-md-6">
            <BentoCard
              icon="📊"
              title={<GrayTitle>AI Feedback Reports</GrayTitle>}
              desc="Post-interview analysis by Gemini with actionable insights."
            >
              <MockUI rows={5} />
            </BentoCard>
          </div>

          <div className="col-12 col-md-6">
            <BentoCard
              icon="🗓️"
              title={<GoldTitle>Slot-based Scheduling</GoldTitle>}
              desc="Interviewers set availability once. Interviewees pick from open slots and confirm with one click — no back-and-forth needed."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                {SLOTS.map((s) => (
                  <span
                    key={s.label}
                    className={s.cls}
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid' }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <div className="section-center">
          <SectionLabel>Who it&apos;s for</SectionLabel>
          <SectionHeading gray="Built for both sides" gold="of the table" />
        </div>

        <div className="roles-grid">
          {ROLES.map((role) => (
            <div key={role.label} className="role-card">
              <div className="role-card-glow" />
              <span className="role-badge">{role.label}</span>
              <h3>{role.title}</h3>
              <p className="role-desc">{role.desc}</p>
              <ul className="role-perks">
                {role.perks.map((p) => (
                  <li key={p} className="role-perk">
                    <span className="role-perk-check">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="section-center">
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading
            gray="Simple, transparent"
            gold="credit-based plans"
          />
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.875rem' }}>
            Each credit = one session. Unused credits roll over. Prices in ₹.
          </p>
        </div>

        <PricingSection />
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <StarsBackground starColor="#FFF" />

          <h2 className="cta-title">
            <GrayTitle>Your next interview</GrayTitle>
            <br />
            <GoldTitle>starts here</GoldTitle>
          </h2>

          <p className="cta-subtitle">
            Join thousands of engineers already levelling up on Prept.
          </p>

          <div className="cta-buttons">
            <Link to="/onboarding">
              <Button variant="gold" size="hero">
                Get started
              </Button>
            </Link>

            <Link to="/explore">
              <Button variant="outline" size="hero">
                Browse Interviewers →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
