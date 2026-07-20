'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import { Sparkles, AlertCircle } from 'lucide-react';
import { PLAN_LIMITS } from '../../../../../apps/api/src/modules/billing/plan-limits';

interface UsageStats {
  plan: string;
  status: string;
  usage: {
    connectedAccounts: number;
    scheduledPostsThisMonth: number;
    aiRequestsThisMonth: number;
  };
}

export default function BillingPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase}/api/billing/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load usage stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [apiBase, getToken]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/billing/create-portal-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Portal redirect failed');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to redirect to billing management portal.');
      setPortalLoading(false);
    }
  };

  const planName = (stats?.plan || 'FREE').toUpperCase();
  const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.FREE;

  const usageItems = stats
    ? [
        {
          label: 'Connected Instagram Accounts',
          current: stats.usage.connectedAccounts,
          max: limits.maxConnectedAccounts,
        },
        {
          label: 'Scheduled Posts (This Month)',
          current: stats.usage.scheduledPostsThisMonth,
          max: limits.maxScheduledPostsPerMonth,
        },
        {
          label: 'AI Content Generations (This Month)',
          current: stats.usage.aiRequestsThisMonth,
          max: limits.maxAiRequestsPerMonth,
        },
      ]
    : [];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Billing &amp; Payments</h1>
            <p className="text-zinc-400 text-sm mt-1">Review active plan limits, track usage quotas, and manage billing details.</p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading || stats?.plan === 'FREE'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {portalLoading ? 'Redirecting...' : '💳 Manage Stripe Billing'}
          </button>
        </div>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-zinc-500 italic">Retrieving workspace usage statistics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Usage Quotas Progress Bars */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-zinc-800 bg-zinc-950/20 flex flex-col gap-6">
              <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-pink-500" />
                Monthly Quota Usage
              </h3>

              <div className="flex flex-col gap-5">
                {usageItems.map((item) => {
                  const percentage = item.max > 0 ? Math.min(100, Math.round((item.current / item.max) * 100)) : 0;
                  const isLimitClose = percentage >= 80;
                  return (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-300">
                        <span>{item.label}</span>
                        <span className={isLimitClose ? 'text-pink-400 font-bold' : ''}>
                          {item.current} / {item.max > 5000 ? 'Unlimited' : item.max}
                        </span>
                      </div>
                      <div className="h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLimitClose
                              ? 'bg-gradient-to-r from-pink-500 to-red-500'
                              : 'bg-gradient-to-r from-pink-500 to-violet-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Billing Cycle Summary */}
            <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800 bg-zinc-950/10">
              <div className="flex flex-col gap-3">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Plan Tier</span>
                <span className="text-2xl font-black text-white">{planName}</span>
                <span className={`text-2xs font-bold border w-fit px-2 py-0.5 rounded-full ${
                  stats?.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {stats?.status || 'ACTIVE'}
                </span>
                <p className="text-zinc-500 text-2xs leading-relaxed mt-2">
                  Quotas reset on the 1st of each calendar month. Upgrading plan immediately expands your limits.
                </p>
              </div>

              {stats?.plan === 'FREE' && (
                <div className="p-3 border border-pink-500/20 bg-pink-500/5 text-pink-400 rounded-xl text-2xs flex gap-2 items-start mt-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>You are currently on the Free plan. Upgrade to Starter or Pro to unlock deeper scheduled posts limits and AI caption generation.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </NavigationWrapper>
  );
}
