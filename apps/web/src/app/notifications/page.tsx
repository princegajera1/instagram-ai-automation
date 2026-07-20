'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import { ShieldCheck, CreditCard, RefreshCw, AlertCircle, CheckSquare } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'POST_PUBLISHED' | 'POST_FAILED' | 'BILLING';
  isRead: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, any> = {
  SYSTEM: RefreshCw,
  POST_PUBLISHED: ShieldCheck,
  POST_FAILED: AlertCircle,
  BILLING: CreditCard,
};

export default function NotificationsPage() {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchNotifications = useCallback(async (pageNum: number, unread: boolean) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${apiBase}/api/notifications?page=${pageNum}&limit=10&unreadOnly=${unread}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data.items || []);
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, getToken]);

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
  }, [fetchNotifications, unreadOnly]);

  const markAsRead = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all read', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Notifications</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Stay updated with automatic publishes, billing alerts, and system state updates.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUnreadOnly((prev) => !prev)}
              className={`text-xs font-semibold px-4 py-2 border rounded-xl transition-colors ${
                unreadOnly
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
            </button>
            <button
              onClick={markAllAsRead}
              disabled={actionLoading || notifications.every((n) => n.isRead)}
              className="text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-zinc-950 px-4 py-2 border border-zinc-800 rounded-xl flex items-center gap-1.5"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-zinc-500 py-8 italic">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-zinc-500 py-8 italic border border-dashed border-zinc-800 rounded-2xl">
              No notifications to display.
            </div>
          ) : (
            notifications.map((alert) => {
              const Icon = ICON_MAP[alert.type] || RefreshCw;
              return (
                <div
                  key={alert.id}
                  onClick={() => !alert.isRead && markAsRead(alert.id)}
                  className={`glass-panel rounded-2xl p-5 flex items-start gap-4 border transition-all cursor-pointer ${
                    alert.isRead ? 'border-zinc-900 opacity-60' : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      alert.type === 'POST_PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : alert.type === 'BILLING'
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        : alert.type === 'POST_FAILED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        {alert.title}
                        {!alert.isRead && (
                          <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
                        )}
                      </span>
                      <span className="text-zinc-500 text-xs shrink-0">
                        {new Date(alert.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => fetchNotifications(page - 1, unreadOnly)}
              disabled={page <= 1}
              className="text-xs font-semibold px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchNotifications(page + 1, unreadOnly)}
              disabled={page >= totalPages}
              className="text-xs font-semibold px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </NavigationWrapper>
  );
}
