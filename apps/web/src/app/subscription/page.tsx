'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PlanDetails {
  name: string;
  price: string;
  description: string;
  features: string[];
}

const TIER_DETAILS: Record<string, PlanDetails> = {
  FREE: {
    name: 'Free Plan',
    price: '$0/mo',
    description: 'Perfect for testing and personal side projects.',
    features: ['1 connected Instagram account', '5 scheduled posts per month', '10 AI caption generations/month', 'Standard support'],
  },
  STARTER: {
    name: 'Starter Plan',
    price: '$9/mo',
    description: 'Great for casual creators stepping up their game.',
    features: ['3 connected Instagram accounts', '30 scheduled posts per month', '50 AI caption generations/month', 'Priority calendar scheduling', 'Standard analytics tracking'],
  },
  PRO: {
    name: 'Pro Plan',
    price: '$29/mo',
    description: 'Ideal for professional brands and businesses.',
    features: ['5 connected Instagram accounts', '100 scheduled posts per month', '200 AI caption generations/month', 'Priority calendar scheduling', 'Detailed analytics dashboard', '24/7 priority support'],
  },
  BUSINESS: {
    name: 'Business Plan',
    price: '$79/mo',
    description: 'For power users and social scaling brands.',
    features: ['10 connected Instagram accounts', '500 scheduled posts per month', '1000 AI caption generations/month', 'Priority calendar scheduling', 'Detailed analytics dashboard', '24/7 priority support'],
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    price: '$199/mo',
    description: 'For agencies managing large portfolios.',
    features: ['Unlimited connected accounts', 'Unlimited scheduled posts', 'Unlimited AI caption generations', 'Priority calendar scheduling', 'Detailed analytics dashboard', 'Dedicated Account Manager'],
  },
};

export default function SubscriptionPage() {
  const { getToken } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>('FREE');
  const [currentStatus, setCurrentStatus] = useState<string>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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
          setCurrentPlan(data.plan || 'FREE');
          setCurrentStatus(data.status || 'ACTIVE');
        }
      } catch (err) {
        console.error('Failed to load subscription details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [apiBase, getToken]);

  const handleUpgrade = async (planKey: string) => {
    setActionLoading(planKey);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upgrade request failed');
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start Stripe upgrade flow.');
      setActionLoading(null);
    }
  };

  const activePlanInfo = TIER_DETAILS[currentPlan.toUpperCase()] || TIER_DETAILS.FREE;

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-5xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Subscription Management</h1>
          <p className="text-zinc-400 text-sm mt-1">Upgrade your workspace plan to expand posting and AI quotas.</p>
        </div>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-zinc-500 italic">Retrieving subscription status...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Plan Detail Card */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-pink-500/20 bg-zinc-950/20 shadow-lg shadow-pink-500/5">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 w-fit">
                    Active Workspace Tier
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">{activePlanInfo.name}</h3>
                </div>
                <span className="text-2xl font-extrabold text-white">{activePlanInfo.price}</span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed">
                Your workspace is currently running on the <span className="font-semibold text-white">{currentPlan}</span> tier. Status: <span className="font-bold text-pink-400">{currentStatus}</span>.
              </p>

              <div className="h-px bg-zinc-800" />

              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Features Included</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePlanInfo.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar quick actions */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800 bg-zinc-950/10">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-white text-base">Plan Upgrades</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Looking to scale your limits? Connect more accounts and schedule more posts each month by choosing one of our custom tiers.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Link href="/pricing" className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-xs text-center shadow-md shadow-pink-500/10 hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  View All Plan Tiers
                </Link>
                <Link href="/billing" className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 font-semibold text-xs text-center transition-all">
                  Manage Monthly Usage
                </Link>
              </div>
            </div>

            {/* Upgrade Selection Grid (5 tiers list) */}
            <div className="lg:col-span-3 flex flex-col gap-4 mt-4">
              <h3 className="font-bold text-white text-lg">Change Your Workspace Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(TIER_DETAILS).map(([key, details]) => {
                  const isCurrent = key.toUpperCase() === currentPlan.toUpperCase();
                  return (
                    <div
                      key={key}
                      className={`glass-panel rounded-xl p-5 border flex flex-col justify-between ${
                        isCurrent ? 'border-pink-500/40 bg-pink-500/5' : 'border-zinc-800 bg-zinc-950/20'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">{details.name}</h4>
                        <span className="text-lg font-black text-zinc-200 block mt-1">{details.price}</span>
                        <p className="text-zinc-500 text-2xs mt-2 leading-relaxed">{details.description}</p>
                      </div>

                      <button
                        onClick={() => handleUpgrade(key)}
                        disabled={isCurrent || actionLoading !== null}
                        className={`w-full py-2 px-3 mt-4 rounded-lg font-bold text-2xs transition-colors ${
                          isCurrent
                            ? 'bg-zinc-800 text-zinc-500 cursor-default'
                            : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:opacity-95'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : actionLoading === key ? '...' : `Select ${key}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </NavigationWrapper>
  );
}
