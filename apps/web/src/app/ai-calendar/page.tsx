'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';

interface CalendarDay {
  day: number;
  contentIdea: string;
  suggestedCaption: string;
  suggestedPostType: 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' | 'STORY';
  suggestedTime: string;
}

interface TrendingIdea {
  title: string;
  description: string;
  format: string;
  hook: string;
}

type TabType = 'calendar' | 'trending';

const TYPE_ICONS: Record<string, string> = {
  IMAGE: '🖼',
  VIDEO: '🎬',
  REEL: '🎞',
  CAROUSEL: '🎠',
  STORY: '⚡',
};

export default function AiCalendarPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [tab, setTab] = useState<TabType>('calendar');
  const [niche, setNiche] = useState('');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarPlan, setCalendarPlan] = useState<CalendarDay[]>([]);
  const [calendarMeta, setCalendarMeta] = useState<{ niche: string; days: number; disclaimer: string } | null>(null);
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>([]);
  const [trendingDisclaimer, setTrendingDisclaimer] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [addedDays, setAddedDays] = useState<Set<number>>(new Set());

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const aiPost = async (path: string, body: Record<string, unknown>) => {
    const token = await getToken();
    const res = await fetch(`${apiBase}/api/ai/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Request failed (${res.status})`);
    }
    return res.json();
  };

  const handleGenerateCalendar = async () => {
    if (!niche.trim()) {
      setError('Please enter a niche or topic.');
      return;
    }
    setError('');
    setLoading(true);
    setCalendarPlan([]);
    setCalendarMeta(null);
    try {
      const res = await aiPost('calendar/generate', { niche, days });
      setCalendarPlan(res.plan || []);
      setCalendarMeta({ niche: res.niche, days: res.days, disclaimer: res.disclaimer });
    } catch (err: any) {
      setError(err.message || 'Failed to generate calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTrending = async () => {
    if (!niche.trim()) {
      setError('Please enter a niche or topic.');
      return;
    }
    setError('');
    setLoading(true);
    setTrendingIdeas([]);
    try {
      const res = await aiPost('trending-ideas', { niche });
      setTrendingIdeas(res.ideas || []);
      setTrendingDisclaimer(res.disclaimer || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trending ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = (day: CalendarDay) => {
    // Pre-fill the create-post form via query params (read by create-post page on mount)
    const params = new URLSearchParams({
      caption: day.suggestedCaption,
      type: day.suggestedPostType,
      prefillTime: day.suggestedTime,
    });
    setAddedDays((prev) => new Set(prev).add(day.day));
    router.push(`/create-post?${params.toString()}`);
  };

  const typeColor: Record<string, string> = {
    IMAGE: '#6366f1',
    VIDEO: '#8b5cf6',
    REEL: '#ec4899',
    CAROUSEL: '#f59e0b',
    STORY: '#10b981',
  };

  return (
    <NavigationWrapper>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0b1e 50%, #0a0f1e 100%)',
        padding: '2rem',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{
              fontSize: '1.9rem', fontWeight: 800, margin: 0,
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ✨ AI Content Studio
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
              AI-generated content plans — review and customize before publishing
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0' }}>
          {(['calendar', 'trending'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.7rem 1.4rem',
                fontSize: '0.9rem', fontWeight: 600,
                color: tab === t ? '#c4b5fd' : '#6b7280',
                borderBottom: tab === t ? '2px solid #8b5cf6' : '2px solid transparent',
                transition: 'all 0.18s',
              }}
            >
              {t === 'calendar' ? '📅 Content Calendar' : '🔥 Trending Ideas'}
            </button>
          ))}
        </div>

        {/* Input Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Niche / Topic *
            </label>
            <input
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '0.7rem 1rem', color: '#e2e8f0', fontSize: '0.92rem',
                outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="e.g. Fitness, Travel, SaaS startup, Vegan recipes…"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (tab === 'calendar' ? handleGenerateCalendar() : handleGenerateTrending())}
            />
          </div>

          {tab === 'calendar' && (
            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                Duration (days)
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.7rem 1rem', color: '#e2e8f0', fontSize: '0.92rem', outline: 'none',
                }}
              >
                {[7, 14, 21, 30, 60, 90].map((d) => (
                  <option key={d} value={d} style={{ background: '#1a1a2e' }}>{d} days</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={tab === 'calendar' ? handleGenerateCalendar : handleGenerateTrending}
            disabled={loading}
            style={{
              background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
              border: 'none', color: 'white', padding: '0.72rem 1.8rem', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                Generating…
              </>
            ) : (
              tab === 'calendar' ? '✨ Generate Calendar' : '🔥 Get Trending Ideas'
            )}
          </button>
        </div>

        {error && (
          <div style={{
            color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem',
          }}>
            {error}
          </div>
        )}

        {/* ── Calendar Tab ─────────────────────────────────────────────────── */}
        {tab === 'calendar' && calendarPlan.length > 0 && (
          <div>
            {calendarMeta && (
              <div style={{
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '12px', padding: '0.85rem 1.1rem', marginBottom: '1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#c4b5fd' }}>
                    {calendarMeta.days}-Day Content Calendar
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                    for &ldquo;{calendarMeta.niche}&rdquo;
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#4b5563', fontStyle: 'italic', maxWidth: '420px' }}>
                  ⚠️ {calendarMeta.disclaimer}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calendarPlan.map((day) => (
                <div
                  key={day.day}
                  style={{
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s',
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.2rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  >
                    <span style={{
                      minWidth: '38px', height: '38px', background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.82rem', color: '#c4b5fd',
                    }}>
                      D{day.day}
                    </span>

                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700,
                      background: `${typeColor[day.suggestedPostType] || '#6366f1'}22`,
                      color: typeColor[day.suggestedPostType] || '#6366f1',
                      border: `1px solid ${typeColor[day.suggestedPostType] || '#6366f1'}44`,
                    }}>
                      {TYPE_ICONS[day.suggestedPostType]} {day.suggestedPostType}
                    </span>

                    <span style={{ flex: 1, fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {day.contentIdea}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: '#6b7280', minWidth: '50px', textAlign: 'right' }}>
                      🕐 {day.suggestedTime}
                    </span>

                    <span style={{ color: '#6b7280', fontSize: '0.7rem', minWidth: '20px' }}>
                      {expandedDay === day.day ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {expandedDay === day.day && (
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '1rem 1.2rem',
                      background: 'rgba(139,92,246,0.02)',
                    }}>
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Suggested Caption
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 1rem', whiteSpace: 'pre-wrap' }}>
                        {day.suggestedCaption}
                      </p>
                      <button
                        onClick={() => handleAddToCalendar(day)}
                        disabled={addedDays.has(day.day)}
                        style={{
                          background: addedDays.has(day.day) ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                          border: addedDays.has(day.day) ? '1px solid rgba(16,185,129,0.3)' : 'none',
                          color: addedDays.has(day.day) ? '#34d399' : 'white',
                          padding: '0.6rem 1.4rem', borderRadius: '9px', fontSize: '0.87rem', fontWeight: 700,
                          cursor: addedDays.has(day.day) ? 'default' : 'pointer',
                          transition: 'opacity 0.18s',
                        }}
                      >
                        {addedDays.has(day.day) ? '✓ Added to Create Post' : '+ Add to Calendar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trending Ideas Tab ────────────────────────────────────────────── */}
        {tab === 'trending' && trendingIdeas.length > 0 && (
          <div>
            {trendingDisclaimer && (
              <div style={{
                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                fontSize: '0.82rem', color: '#fbbf24',
              }}>
                ⚠️ {trendingDisclaimer}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {trendingIdeas.map((idea, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px', padding: '1.2rem',
                    display: 'flex', flexDirection: 'column', gap: '0.6rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700,
                      background: `${typeColor[idea.format] || '#6366f1'}22`,
                      color: typeColor[idea.format] || '#6366f1',
                    }}>
                      {TYPE_ICONS[idea.format] || '📱'} {idea.format}
                    </span>
                    <span style={{ fontSize: '1.2rem', color: '#4b5563' }}>#{i + 1}</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.35 }}>
                    {idea.title}
                  </h3>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
                    {idea.description}
                  </p>

                  <div style={{
                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '8px', padding: '0.55rem 0.8rem',
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                      HOOK
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#c4b5fd', fontStyle: 'italic' }}>
                      &ldquo;{idea.hook}&rdquo;
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const params = new URLSearchParams({ caption: idea.hook, type: idea.format });
                      router.push(`/create-post?${params.toString()}`);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                      border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd',
                      padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'opacity 0.18s', marginTop: 'auto',
                    }}
                  >
                    → Use This Idea
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && calendarPlan.length === 0 && trendingIdeas.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '20px',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {tab === 'calendar' ? '📅' : '🔥'}
            </div>
            <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {tab === 'calendar'
                ? 'Enter a niche and click Generate Calendar'
                : 'Enter a niche and click Get Trending Ideas'}
            </p>
            <p style={{ color: '#374151', fontSize: '0.85rem' }}>
              AI suggestions are generated using GPT-4o-mini and are clearly labeled as estimates — not live data.
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          button:hover { opacity: 0.9; }
          select option { background: #1a1a2e; }
          input::placeholder { color: #374151; }
        `}</style>
      </div>
    </NavigationWrapper>
  );
}
