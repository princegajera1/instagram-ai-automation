'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import styles from './calendar.module.css';

type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
type PostType = 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' | 'STORY';

interface MediaFile {
  id: string;
  url: string;
  mimeType: string;
}

interface Post {
  id: string;
  caption: string;
  hashtags?: string;
  type: PostType;
  status: PostStatus;
  scheduledAt?: string;
  mediaFiles: MediaFile[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: '#6b7280',
  SCHEDULED: '#8b5cf6',
  PUBLISHED: '#10b981',
  FAILED: '#ef4444',
};

const TYPE_ICONS: Record<PostType, string> = {
  IMAGE: '🖼️',
  VIDEO: '🎥',
  REEL: '🎬',
  CAROUSEL: '📚',
  STORY: '⭕',
};

export default function CalendarPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const start = new Date(currentYear, currentMonth, 1).toISOString();
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
      const res = await fetch(
        `${apiBase}/api/posts?startDate=${start}&endDate=${end}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, getToken, currentYear, currentMonth]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const getPostsForDay = (day: number): Post[] =>
    posts.filter((p) => {
      if (!p.scheduledAt) return false;
      const d = new Date(p.scheduledAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });

  const getDraftPostsForDay = (day: number): Post[] =>
    posts.filter((p) => {
      if (p.scheduledAt) return false;
      // Group drafts under today if no scheduled date
      return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    });

  const selectedDayPosts = selectedDay != null
    ? [...getPostsForDay(selectedDay), ...getDraftPostsForDay(selectedDay)]
    : [];

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    const token = await getToken();
    await fetch(`${apiBase}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSelectedPost(null);
    await fetchPosts();
  };

  const duplicatePost = async (postId: string) => {
    const token = await getToken();
    await fetch(`${apiBase}/api/posts/${postId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchPosts();
  };

  return (
    <NavigationWrapper>
      <div className={styles.page}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Content Calendar</h1>
            <p className={styles.subtitle}>Plan and schedule your Instagram content</p>
          </div>
          <button className={styles.createBtn} onClick={() => router.push('/create-post')}>
            + Create Post
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className={styles.calNav}>
          <button className={styles.navBtn} onClick={prevMonth}>‹</button>
          <h2 className={styles.monthTitle}>{MONTH_NAMES[currentMonth]} {currentYear}</h2>
          <button className={styles.navBtn} onClick={nextMonth}>›</button>
          <button className={styles.todayBtn} onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); }}>
            Today
          </button>
        </div>

        <div className={styles.mainLayout}>
          {/* Calendar Grid */}
          <div className={styles.calendarSection}>
            {/* Day names */}
            <div className={styles.dayNames}>
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className={styles.dayName}>{d}</div>
              ))}
            </div>

            {/* Grid Cells */}
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
              </div>
            ) : (
              <div className={styles.grid}>
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const dayNum = idx - firstDayOfMonth + 1;
                  const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                  const isToday = isValid && dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  const dayPosts = isValid ? getPostsForDay(dayNum) : [];
                  const isSelected = isValid && dayNum === selectedDay;

                  return (
                    <div
                      key={idx}
                      className={`${styles.cell} ${!isValid ? styles.cellEmpty : ''} ${isToday ? styles.cellToday : ''} ${isSelected ? styles.cellSelected : ''}`}
                      onClick={() => isValid && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                    >
                      {isValid && (
                        <>
                          <span className={styles.dayNum}>{dayNum}</span>
                          <div className={styles.postDots}>
                            {dayPosts.slice(0, 4).map((p) => (
                              <span
                                key={p.id}
                                className={styles.postDot}
                                style={{ background: STATUS_COLORS[p.status] }}
                                title={`${TYPE_ICONS[p.type]} ${p.caption?.slice(0, 30) || 'No caption'}`}
                              />
                            ))}
                            {dayPosts.length > 4 && (
                              <span className={styles.moreCount}>+{dayPosts.length - 4}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className={styles.legend}>
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <div key={s} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c }} />
                  <span className={styles.legendLabel}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel: Day Posts */}
          <div className={styles.sidePanel}>
            {selectedDay ? (
              <>
                <div className={styles.sidePanelHeader}>
                  <h3 className={styles.sidePanelTitle}>
                    {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
                  </h3>
                  <button
                    className={styles.addPostBtn}
                    onClick={() => router.push('/create-post')}
                  >+ Add</button>
                </div>

                {selectedDayPosts.length === 0 ? (
                  <div className={styles.emptyDay}>
                    <div className={styles.emptyDayIcon}>📅</div>
                    <p>No posts scheduled</p>
                    <button className={styles.createPostLink} onClick={() => router.push('/create-post')}>
                      Create a post
                    </button>
                  </div>
                ) : (
                  <div className={styles.postList}>
                    {selectedDayPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`${styles.postCard} ${selectedPost?.id === post.id ? styles.postCardActive : ''}`}
                        onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      >
                        <div className={styles.postCardTop}>
                          <div className={styles.postThumb}>
                            {post.mediaFiles[0] ? (
                              post.mediaFiles[0].mimeType.startsWith('video') ? (
                                <video src={post.mediaFiles[0].url} className={styles.thumbImg} />
                              ) : (
                                <img src={post.mediaFiles[0].url} alt="thumb" className={styles.thumbImg} />
                              )
                            ) : (
                              <div className={styles.thumbPlaceholder}>{TYPE_ICONS[post.type]}</div>
                            )}
                          </div>
                          <div className={styles.postMeta}>
                            <span
                              className={styles.postStatus}
                              style={{ background: `${STATUS_COLORS[post.status]}22`, color: STATUS_COLORS[post.status], borderColor: STATUS_COLORS[post.status] }}
                            >
                              {post.status}
                            </span>
                            <span className={styles.postType}>{TYPE_ICONS[post.type]} {post.type}</span>
                            {post.scheduledAt && (
                              <span className={styles.postTime}>
                                🕐 {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        {post.caption && (
                          <p className={styles.postCaption}>{post.caption.slice(0, 100)}{post.caption.length > 100 ? '…' : ''}</p>
                        )}

                        {selectedPost?.id === post.id && (
                          <div className={styles.postActions}>
                            <button
                              className={styles.actionEdit}
                              onClick={(e) => { e.stopPropagation(); router.push(`/create-post?edit=${post.id}`); }}
                            >✏️ Edit</button>
                            <button
                              className={styles.actionDuplicate}
                              onClick={(e) => { e.stopPropagation(); duplicatePost(post.id); }}
                            >📋 Duplicate</button>
                            <button
                              className={styles.actionDelete}
                              onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                            >🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.sidePanelPlaceholder}>
                <div className={styles.placeholderIcon}>🗓️</div>
                <p className={styles.placeholderText}>Click a day to see scheduled posts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
