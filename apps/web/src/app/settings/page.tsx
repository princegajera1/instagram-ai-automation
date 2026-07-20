'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import { User, Bell, Key, RefreshCw, Link2, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectedAccount {
  id: string;
  platform: string;
  platformAccountId: string;
  expiresAt: string | null;
  status: 'ACTIVE' | 'TOKEN_EXPIRED' | 'SUSPENDED';
  instagramAccount: {
    username: string;
    displayName: string | null;
    profilePictureUrl: string | null;
    followersCount: number;
    isActive: boolean;
  } | null;
}

function SettingsContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAccounts = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${apiBase}/api/instagram/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch connected accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAccounts();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const username = searchParams.get('username');

    if (status === 'success' && username) {
      setFeedback({
        type: 'success',
        message: `Successfully connected Instagram account @${username}!`,
      });
      // Clear URL params
      router.replace('/settings');
    } else if (status === 'error' && message) {
      setFeedback({
        type: 'error',
        message: `Connection failed: ${message}`,
      });
      router.replace('/settings');
    }
  }, [searchParams]);

  const handleConnect = async () => {
    try {
      setActionLoading('connect');
      const token = await getToken();
      if (!token) {
        setFeedback({ type: 'error', message: 'You must be logged in to connect accounts.' });
        return;
      }
      window.location.href = `${apiBase}/api/instagram/connect?token=${token}`;
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to start authentication' });
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this Instagram account? This will stop all scheduled posts and automation.')) {
      return;
    }

    try {
      setActionLoading(accountId);
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${apiBase}/api/instagram/disconnect/${accountId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Account disconnected successfully.' });
        fetchAccounts();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to disconnect account');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Disconnect failed' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure profile details, connected platforms, API settings, and billing.</p>
      </div>

      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-950/40 border-rose-500/20 text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1">{feedback.message}</div>
            <button
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sub-options */}
        <div className="md:col-span-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-900 border border-zinc-800 text-pink-400 w-full text-left">
            <User className="h-4 w-4" />
            General
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 w-full text-left">
            <Bell className="h-4 w-4" />
            Alerts
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 w-full text-left">
            <Key className="h-4 w-4" />
            API Credentials
          </button>
        </div>

        {/* Form details */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Workspace Details */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Workspace Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400">Workspace Name</label>
                <input
                  type="text"
                  defaultValue="My Instagram Engine"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400">Primary Contact Email</label>
                <input
                  type="email"
                  defaultValue="contact@mycompany.com"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Connected Accounts Section */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-lg">Connected Accounts</h3>
              <button
                disabled={actionLoading === 'connect'}
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" />
                {actionLoading === 'connect' ? 'Connecting...' : 'Connect Instagram'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 text-zinc-500 text-sm">
                <RefreshCw className="h-5 w-5 animate-spin mr-3 text-pink-400" />
                Loading linked channels...
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                <AlertTriangle className="h-8 w-8 text-zinc-600 mb-2" />
                <span className="font-semibold text-sm text-zinc-400">No Channels Connected</span>
                <span className="text-xs text-zinc-500 mt-1">Connect your Instagram Business account to schedule publications.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {accounts.map((account) => {
                  const details = account.instagramAccount;
                  const isExpired = account.status === 'TOKEN_EXPIRED';
                  const isSuspended = account.status === 'SUSPENDED';
                  
                  return (
                    <div
                      key={account.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {details?.profilePictureUrl ? (
                          <img
                            src={details.profilePictureUrl}
                            alt={details.username}
                            className="h-10 w-10 rounded-full border border-zinc-800 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                            IG
                          </div>
                        )}
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">@{details?.username || 'Unknown'}</span>
                            {isExpired ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Token Expired
                              </span>
                            ) : isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Connected
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-500 text-xs mt-0.5">
                            {details?.displayName || 'Instagram Channel'} • {details?.followersCount || 0} followers
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isExpired && (
                          <button
                            disabled={actionLoading !== null}
                            onClick={handleConnect}
                            className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/20 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 rounded-lg text-xs font-semibold transition-all"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Reconnect
                          </button>
                        )}
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleDisconnect(account.id)}
                          className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-950 hover:bg-rose-950/40 hover:border-rose-900/50 text-zinc-400 hover:text-rose-400 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <NavigationWrapper>
      <Suspense fallback={<div className="text-white p-8">Loading settings layout...</div>}>
        <SettingsContent />
      </Suspense>
    </NavigationWrapper>
  );
}
