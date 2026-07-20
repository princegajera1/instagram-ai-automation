'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import NavigationWrapper from '@/components/NavigationWrapper';
import {
  Users,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  createdAt: string;
}

interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  postsPublished: number;
  totalAIRequests: number;
}

interface SystemHealth {
  status: string;
  database: string;
  redis: string;
  queues: {
    publishQueueWaiting: number;
    warningQueueWaiting: number;
  };
}

interface UsageAction {
  action: string;
  count: number;
  tokens: number;
  cost: number;
}

interface UsageUser {
  userId: string;
  email: string;
  name: string;
  requestsCount: number;
  tokensUsed: number;
  estimatedCost: number;
}

interface ApiUsage {
  actionsBreakdown: UsageAction[];
  topUsers: UsageUser[];
}

export default function AdminPage() {
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // States
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [error, setError] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // ─── Guard Check ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && clerkUser) {
      const role = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role;
      if (role === 'ADMIN') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace('/dashboard'); // Kick out non-admin
      }
    }
  }, [isLoaded, clerkUser, router]);

  const adminGet = useCallback(async (path: string) => {
    const token = await getToken();
    const res = await fetch(`${apiBase}/api/admin/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Forbidden: Admin role required');
      throw new Error(`Failed to fetch ${path}`);
    }
    return res.json();
  }, [apiBase, getToken]);

  const loadAdminData = useCallback(async (searchQuery: string = '', pageNum: number = 1) => {
    if (isAdmin !== true) return;
    setLoading(true);
    setError('');
    try {
      const [usersData, statsData, healthData, usageData] = await Promise.all([
        adminGet(`users?page=${pageNum}&limit=10&search=${searchQuery}`),
        adminGet('analytics'),
        adminGet('system-health'),
        adminGet('api-usage'),
      ]);

      setUsers(usersData.items || []);
      setUsersPage(usersData.page || 1);
      setUsersPages(usersData.pages || 1);
      setStats(statsData);
      setHealth(healthData);
      setUsage(usageData);
    } catch (err: any) {
      setError(err.message || 'Failed to load administration panel data.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminGet]);

  useEffect(() => {
    if (isAdmin === true) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAdminData(search, 1);
  };

  const toggleUserActive = async (userId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
        );
      }
    } catch (err) {
      console.error('Failed to toggle user activity', err);
    }
  };

  if (isAdmin === null || isAdmin === false) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center text-zinc-500 font-semibold text-sm">
        Authenticating Administrator session...
      </div>
    );
  }

  if (loading) {
    return (
      <NavigationWrapper>
        <div className="text-zinc-500 italic">Loading administration metrics...</div>
      </NavigationWrapper>
    );
  }

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-7xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Administration Panel</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Global status monitoring, system diagnostics, and platform billing limits enforcement.
          </p>
        </div>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Global stats cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800 bg-zinc-950/20">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
              </div>
              <div className="h-11 w-11 rounded-lg bg-zinc-900 flex items-center justify-center text-violet-400 border border-zinc-800">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800 bg-zinc-950/20">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Posts</span>
                <span className="text-2xl font-bold text-white">{stats.totalPosts}</span>
              </div>
              <div className="h-11 w-11 rounded-lg bg-zinc-900 flex items-center justify-center text-pink-400 border border-zinc-800">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800 bg-zinc-950/20">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Published</span>
                <span className="text-2xl font-bold text-white">{stats.postsPublished}</span>
              </div>
              <div className="h-11 w-11 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400 border border-zinc-800">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800 bg-zinc-950/20">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">AI Generations</span>
                <span className="text-2xl font-bold text-white">{stats.totalAIRequests}</span>
              </div>
              <div className="h-11 w-11 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 border border-zinc-800">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main User management (Left: 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="glass-panel rounded-2xl border border-zinc-800 p-6 bg-zinc-950/10">
              <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
                <h3 className="font-bold text-white text-lg">User Management</h3>
                <form onSubmit={handleSearch} className="flex items-center gap-2 border border-zinc-800 bg-black px-3 py-1.5 rounded-xl w-64">
                  <Search className="h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-transparent text-xs text-white outline-none w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-white">{u.name || 'Anonymous'}</div>
                          <div className="text-zinc-500 text-2xs truncate max-w-[200px]">{u.email}</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-2xs font-semibold ${
                            u.role === 'ADMIN' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5">{u.subscriptionPlan}</td>
                        <td className="py-3.5">
                          <span className={`h-2 w-2 rounded-full inline-block mr-1.5 ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Suspended'}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => toggleUserActive(u.id)}
                            className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                              u.isActive
                                ? 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10'
                                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => loadAdminData(search, usersPage - 1)}
                    disabled={usersPage <= 1}
                    className="text-2xs font-bold px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-lg hover:text-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-2xs text-zinc-600">Page {usersPage} of {usersPages}</span>
                  <button
                    onClick={() => loadAdminData(search, usersPage + 1)}
                    disabled={usersPage >= usersPages}
                    className="text-2xs font-bold px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-lg hover:text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Diagnostics + OpenAI Usage (1 col) */}
          <div className="flex flex-col gap-6">
            {/* System Health */}
            {health && (
              <div className="glass-panel rounded-2xl border border-zinc-800 p-6 bg-zinc-950/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-md">System Health</h3>
                  <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                    health.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {health.status}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Database</span>
                    <span className={`font-bold flex items-center gap-1 ${health.database === 'HEALTHY' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {health.database === 'HEALTHY' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {health.database}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> Redis Queue Broker</span>
                    <span className={`font-bold flex items-center gap-1 ${health.redis === 'HEALTHY' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {health.redis === 'HEALTHY' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {health.redis}
                    </span>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 mt-1 flex flex-col gap-2">
                    <div className="flex justify-between text-2xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <span>Queue Name</span>
                      <span>Waiting Jobs</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Post Publisher</span>
                      <span className="font-bold">{health.queues.publishQueueWaiting}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Upcoming Warning Check</span>
                      <span className="font-bold">{health.queues.warningQueueWaiting}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OpenAI API Token Usage */}
            {usage && (
              <div className="glass-panel rounded-2xl border border-zinc-800 p-6 bg-zinc-950/10 flex flex-col gap-4">
                <h3 className="font-bold text-white text-md">AI API Token Usage</h3>

                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usage.actionsBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis dataKey="action" stroke="#71717a" fontSize={8} tickFormatter={(v) => v.replace('_', ' ')} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                      <Bar dataKey="tokens" fill="#ec4899" radius={[4, 4, 0, 0]} name="Tokens" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border-t border-zinc-900 pt-3 mt-1">
                  <span className="text-2xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    Top AI Consumers (Estimated Cost)
                  </span>
                  <div className="flex flex-col gap-2">
                    {usage.topUsers.slice(0, 3).map((tu, i) => (
                      <div key={tu.userId} className="flex justify-between items-center text-xs">
                        <span className="truncate max-w-[140px] text-zinc-400" title={tu.email}>
                          {i+1}. {tu.name || tu.email}
                        </span>
                        <span className="font-bold text-zinc-300">
                          ${tu.estimatedCost.toFixed(4)}
                        </span>
                      </div>
                    ))}
                    {usage.topUsers.length === 0 && (
                      <span className="text-xs text-zinc-600 italic">No usage recorded.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
