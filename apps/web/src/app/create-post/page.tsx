'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import styles from './create-post.module.css';

const POST_TYPES = ['IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'STORY'] as const;
type PostType = (typeof POST_TYPES)[number];

const TONES = ['Funny', 'Professional', 'Motivational', 'Business', 'Luxury', 'Short', 'Long'] as const;
type Tone = (typeof TONES)[number];

interface UploadedMedia {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Post state ──────────────────────────────────────────────────────────────
  const [type, setType] = useState<PostType>('IMAGE');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [mediaFiles, setMediaFiles] = useState<UploadedMedia[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [captionRows, setCaptionRows] = useState(4);

  // ── AI Panel state ──────────────────────────────────────────────────────────
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<Tone>('Professional');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPanel, setAiPanel] = useState(true);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [engagementScore, setEngagementScore] = useState<{
    score: number;
    reasoning: string;
    tips: string[];
    disclaimer: string;
  } | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const charCount = caption.length;
  const charMax = 2200;

  // ── AI Helper ───────────────────────────────────────────────────────────────
  const aiPost = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/ai/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `AI request failed (${res.status})`);
      }
      return res.json();
    },
    [apiBase, getToken],
  );

  // ── Generate Caption + Hashtags ─────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      setAiError('Please enter a topic or description before generating.');
      return;
    }
    setAiError('');
    setAiLoading(true);
    setEngagementScore(null);
    try {
      const [captionRes, hashtagRes] = await Promise.all([
        aiPost('caption/generate', { topic: aiTopic, tone: aiTone }),
        aiPost('hashtags/generate', { captionOrTopic: aiTopic }),
      ]);
      setCaption(captionRes.caption || '');
      const all = [
        ...(hashtagRes.high || []),
        ...(hashtagRes.medium || []),
        ...(hashtagRes.low || []),
      ].join(' ');
      setHashtags(all);
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed. Check your API key or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Rewrite Caption ─────────────────────────────────────────────────────────
  const handleRewrite = async () => {
    if (!caption.trim()) {
      setAiError('Write a caption first before rewriting.');
      return;
    }
    setAiError('');
    setRewriteLoading(true);
    try {
      const res = await aiPost('caption/rewrite', { caption, tone: aiTone });
      setCaption(res.caption || caption);
    } catch (err: any) {
      setAiError(err.message || 'Rewrite failed. Please try again.');
    } finally {
      setRewriteLoading(false);
    }
  };

  // ── Engagement Score ────────────────────────────────────────────────────────
  const handleScoreEngagement = async () => {
    if (!caption.trim()) {
      setAiError('Add a caption before scoring engagement.');
      return;
    }
    setAiError('');
    setScoringLoading(true);
    try {
      const res = await aiPost('engagement-score', { caption, hashtags });
      setEngagementScore(res);
    } catch (err: any) {
      setAiError(err.message || 'Engagement scoring failed.');
    } finally {
      setScoringLoading(false);
    }
  };

  // ── Media Upload ────────────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file: File) => {
      const token = await getToken();
      const tmpId = crypto.randomUUID();
      setUploadingFiles((prev) => [...prev, tmpId]);

      try {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${apiBase}/api/media/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Upload failed');
        }

        const data: UploadedMedia = await res.json();
        setMediaFiles((prev) => [...prev, data]);
      } catch (err: any) {
        alert(`Upload failed: ${err.message}`);
      } finally {
        setUploadingFiles((prev) => prev.filter((id) => id !== tmpId));
      }
    },
    [apiBase, getToken],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(uploadFile);
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (!e.dataTransfer.files) return;
      Array.from(e.dataTransfer.files).forEach(uploadFile);
    },
    [uploadFile],
  );

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Save Post ───────────────────────────────────────────────────────────────
  const handleSave = async (status: 'DRAFT' | 'SCHEDULED') => {
    if (!instagramAccountId.trim()) {
      setSaveError('Please enter an Instagram Account ID.');
      return;
    }
    if (mediaFiles.length === 0) {
      setSaveError('Please upload at least one media file.');
      return;
    }
    if (status === 'SCHEDULED' && !scheduledAt) {
      setSaveError('Please select a scheduled date/time.');
      return;
    }

    setSaveError('');
    setSaving(true);

    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          instagramAccountId,
          caption,
          hashtags,
          location,
          firstComment,
          type,
          status,
          scheduledAt: status === 'SCHEDULED' ? scheduledAt : undefined,
          mediaFileIds: mediaFiles.map((m) => m.id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save post');
      }

      router.push('/calendar');
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const scoreColor =
    engagementScore === null
      ? '#6b7280'
      : engagementScore.score >= 70
      ? '#10b981'
      : engagementScore.score >= 45
      ? '#f59e0b'
      : '#ef4444';

  return (
    <NavigationWrapper>
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.title}>Create New Post</h1>
        </div>

        <div className={styles.layout}>
          {/* Left: Media Upload */}
          <div className={styles.leftPanel}>
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {mediaFiles.length === 0 && uploadingFiles.length === 0 ? (
                <div className={styles.dropPlaceholder}>
                  <div className={styles.dropIcon}>📸</div>
                  <p className={styles.dropText}>Drag &amp; drop media here</p>
                  <p className={styles.dropSub}>JPG, PNG, MP4 • Max 8MB image / 100MB video</p>
                  <button className={styles.browseBtn} type="button">Browse files</button>
                </div>
              ) : (
                <div className={styles.mediaGrid}>
                  {mediaFiles.map((m) => (
                    <div key={m.id} className={styles.mediaThumb}>
                      {m.mimeType.startsWith('video') ? (
                        <video src={m.url} className={styles.thumbMedia} />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="upload" className={styles.thumbMedia} />
                      )}
                      <button
                        className={styles.removeThumb}
                        onClick={(e) => { e.stopPropagation(); removeMedia(m.id); }}
                      >✕</button>
                    </div>
                  ))}
                  {uploadingFiles.map((id) => (
                    <div key={id} className={styles.mediaThumb}>
                      <div className={styles.thumbSpinner} />
                    </div>
                  ))}
                  <div className={styles.addMoreThumb} onClick={() => fileInputRef.current?.click()}>
                    + Add more
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleFileChange}
              />
            </div>

            {/* Post Type Selector */}
            <div className={styles.typeRow}>
              {POST_TYPES.map((t) => (
                <button
                  key={t}
                  className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* ── AI Generate Panel ── */}
            <div className={styles.aiPanel}>
              <button
                className={styles.aiPanelToggle}
                onClick={() => setAiPanel((v) => !v)}
              >
                <span>✨ AI Generate</span>
                <span className={styles.aiToggleIcon}>{aiPanel ? '▲' : '▼'}</span>
              </button>

              {aiPanel && (
                <div className={styles.aiPanelBody}>
                  <div className={styles.aiField}>
                    <label className={styles.aiLabel}>Topic / Description</label>
                    <input
                      className={styles.aiInput}
                      placeholder="e.g. Coffee shop morning routine, mindfulness tips…"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                    />
                  </div>

                  <div className={styles.aiField}>
                    <label className={styles.aiLabel}>Tone</label>
                    <div className={styles.toneGrid}>
                      {TONES.map((t) => (
                        <button
                          key={t}
                          className={`${styles.toneBtn} ${aiTone === t ? styles.toneBtnActive : ''}`}
                          onClick={() => setAiTone(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {aiError && (
                    <div className={styles.aiError}>{aiError}</div>
                  )}

                  <button
                    className={styles.aiGenerateBtn}
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <span className={styles.aiSpinnerWrap}><span className={styles.aiSpinner} /> Generating…</span>
                    ) : (
                      '✨ Generate Caption & Hashtags'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Post Details */}
          <div className={styles.rightPanel}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Instagram Account ID *</label>
              <input
                className={styles.input}
                placeholder="e.g. 17841400000000000"
                value={instagramAccountId}
                onChange={(e) => setInstagramAccountId(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Caption
                <span className={`${styles.charCount} ${charCount > charMax ? styles.charOver : ''}`}>
                  {charCount}/{charMax}
                </span>
              </label>
              <textarea
                className={styles.textarea}
                rows={captionRows}
                placeholder="Write a caption… or use ✨ AI Generate"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onFocus={() => setCaptionRows(8)}
                onBlur={() => setCaptionRows(4)}
                maxLength={charMax}
              />
              {/* Rewrite with AI row */}
              <div className={styles.rewriteRow}>
                <span className={styles.rewriteLabel}>Rewrite with AI:</span>
                <div className={styles.toneGrid}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      className={`${styles.toneBtn} ${aiTone === t ? styles.toneBtnActive : ''}`}
                      onClick={() => setAiTone(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  className={styles.rewriteBtn}
                  onClick={handleRewrite}
                  disabled={rewriteLoading}
                >
                  {rewriteLoading ? '…' : '↺ Rewrite'}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Hashtags</label>
              <input
                className={styles.input}
                placeholder="#travel #photography #reels"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Location</label>
                <input
                  className={styles.input}
                  placeholder="New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>First Comment</label>
              <input
                className={styles.input}
                placeholder="Add a first comment (optional)"
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Schedule Date &amp; Time</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            {/* Engagement Score Card */}
            <div className={styles.engagementSection}>
              <button
                className={styles.scoreBtn}
                onClick={handleScoreEngagement}
                disabled={scoringLoading || !caption.trim()}
              >
                {scoringLoading ? '…Analyzing' : '📊 Score Engagement (AI Estimate)'}
              </button>

              {engagementScore && (
                <div className={styles.scoreCard}>
                  <div className={styles.scoreHeader}>
                    <span className={styles.scoreLabel}>AI Engagement Estimate</span>
                    <span className={styles.scoreValue} style={{ color: scoreColor }}>
                      {engagementScore.score}/100
                    </span>
                  </div>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreBarFill}
                      style={{ width: `${engagementScore.score}%`, background: scoreColor }}
                    />
                  </div>
                  <p className={styles.scoreReasoning}>{engagementScore.reasoning}</p>
                  {engagementScore.tips.length > 0 && (
                    <ul className={styles.scoreTips}>
                      {engagementScore.tips.map((tip, i) => (
                        <li key={i}>💡 {tip}</li>
                      ))}
                    </ul>
                  )}
                  <p className={styles.scoreDisclaimer}>{engagementScore.disclaimer}</p>
                </div>
              )}
            </div>

            {saveError && <p className={styles.saveError}>{saveError}</p>}

            <div className={styles.actionRow}>
              <button
                className={styles.draftBtn}
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                className={styles.scheduleBtn}
                onClick={() => handleSave('SCHEDULED')}
                disabled={saving}
              >
                {saving ? 'Scheduling…' : '📅 Schedule Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
