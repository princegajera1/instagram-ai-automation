'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import NavigationWrapper from '@/components/NavigationWrapper';
import styles from './create-post.module.css';

const POST_TYPES = ['IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'STORY'] as const;
type PostType = (typeof POST_TYPES)[number];

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

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const charCount = caption.length;
  const charMax = 2200;

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
                  <p className={styles.dropText}>Drag & drop media here</p>
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
                placeholder="Write a caption…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onFocus={() => setCaptionRows(8)}
                onBlur={() => setCaptionRows(4)}
                maxLength={charMax}
              />
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
              <label className={styles.label}>Schedule Date & Time</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
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
