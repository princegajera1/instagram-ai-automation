'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import { TrendingUp, Users, Heart, MessageCircle, BarChart2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface OverviewStats {
  followers: number;
  reach: number;
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  isFallback?: boolean;
}

interface GrowthPoint {
  date: string;
  reach: number;
  impressions: number;
  engagementRate: number;
}

interface TopPost {
  id: string;
  caption: string;
  type: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

interface TopHashtag {
  hashtag: string;
  count: number;
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [topHashtags, setTopHashtags] = useState<TopHashtag[]>([]);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchAnalytics = async (accountId: string) => {
    if (!accountId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, growthRes, topPostsRes, topTagsRes] = await Promise.all([
        fetch(`${apiBase}/api/analytics/overview?instagramAccountId=${accountId}`, { headers }).then(r => r.json()),
        fetch(`${apiBase}/api/analytics/growth?instagramAccountId=${accountId}`, { headers }).then(r => r.json()),
        fetch(`${apiBase}/api/analytics/posts/top?instagramAccountId=${accountId}`, { headers }).then(r => r.json()),
        fetch(`${apiBase}/api/analytics/hashtags/top`, { headers }).then(r => r.json()),
      ]);

      if (overviewRes.statusCode >= 400 || growthRes.statusCode >= 400) {
        throw new Error(overviewRes.message || 'Failed to fetch some metrics');
      }

      setOverview(overviewRes);
      setGrowth(growthRes || []);
      setTopPosts(topPostsRes || []);
      setTopHashtags(topTagsRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt auto-load if there is a connected account ID stored in localStorage
    const savedId = localStorage.getItem('lastInstagramAccountId');
    if (savedId) {
      setInstagramAccountId(savedId);
      fetchAnalytics(savedId);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instagramAccountId.trim()) {
      localStorage.setItem('lastInstagramAccountId', instagramAccountId);
      fetchAnalytics(instagramAccountId);
    }
  };

  const cards = overview
    ? [
        { title: 'Followers', value: overview.followers.toLocaleString(), icon: Users },
        { title: 'Est. Reach', value: overview.reach.toLocaleString(), icon: TrendingUp },
        { title: 'Impressions', value: overview.impressions.toLocaleString(), icon: BarChart2 },
        { title: 'Engagement Rate', value: `${(overview.engagementRate * 100).toFixed(1)}%`, icon: Heart },
      ]
    : [];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Analytics Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real performance tracking gathered directly from the Instagram Graph API.
          </p>
        </div>

        {/* Account Selector */}
        <form onSubmit={handleSearchSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Instagram Account ID
            </label>
            <input
              type="text"
              placeholder="e.g. 17841400000000000"
              className="px-4 py-2 border border-zinc-800 rounded-xl bg-zinc-950 text-white w-64 outline-none focus:border-pink-500 transition-colors"
              value={instagramAccountId}
              onChange={(e) => setInstagramAccountId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Analytics'}
          </button>
        </form>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* If no overview loaded, show clean empty state */}
        {!overview && !loading && (
          <div className="glass-panel border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <BarChart2 className="h-16 w-16 text-zinc-600" />
            <h3 className="text-xl font-bold text-white">No Connected Analytics Data</h3>
            <p className="text-zinc-500 max-w-md text-sm">
              Please enter your Instagram Account ID above or connect your account in Settings.
              Snapshots will build once posts are scheduled and published.
            </p>
          </div>
        )}

        {overview && (
          <>
            {overview.isFallback && (
              <div className="p-3 border border-pink-500/20 bg-pink-500/5 text-pink-400 rounded-xl text-xs">
                💡 {overview.isFallback ? 'Showing fallbacks. ' : ''}No snapshot history yet. Post engagement values are currently zero.
              </div>
            )}

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800 bg-zinc-950/30">
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{card.title}</span>
                      <span className="text-2xl font-bold text-white">{card.value}</span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-pink-500 border border-zinc-800">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Growth Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800 bg-zinc-950/20">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 mb-6">
                Audience Reach &amp; Impressions Trend
              </h3>
              <div className="h-[300px] w-full">
                {growth.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic">
                    Not enough data points yet to render trend chart
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="reach" stroke="#ec4899" strokeWidth={2} name="Reach" />
                      <Line type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={2} name="Impressions" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Grid: Top Posts + Top Hashtags */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Performing Posts */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-zinc-800 bg-zinc-950/20">
                <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 mb-4">
                  Top Performing Posts
                </h3>
                {topPosts.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic py-4">No published post data available.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {topPosts.map((post) => (
                      <div key={post.id} className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{post.caption || '(No caption)'}</p>
                          <span className="text-xs text-zinc-500">{post.type} • {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 shrink-0">
                          <span className="flex items-center gap-1 text-pink-500"><Heart className="h-3 w-3" /> {post.likes}</span>
                          <span className="flex items-center gap-1 text-violet-500"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Hashtags */}
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 bg-zinc-950/20">
                <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 mb-4">
                  Top Hashtags Used
                </h3>
                {topHashtags.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic py-4">No hashtags found in history.</p>
                ) : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topHashtags} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                        <XAxis type="number" stroke="#71717a" fontSize={10} />
                        <YAxis dataKey="hashtag" type="category" stroke="#71717a" fontSize={10} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Uses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </NavigationWrapper>
  );
}
