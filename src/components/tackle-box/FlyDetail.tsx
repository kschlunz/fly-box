import { useEffect, useState } from 'react';
import type { FlyRole, TackleBoxPhoto } from '../../data/types';

type DetailData = {
  id: string;
  name: string;
  size: string | null;
  role: FlyRole;
  category: string;
  colors: string | null;
  description: string | null;
  primaryPhotoUrl: string;
  count: number;
  notes: string | null;
  firstIdentifiedAt: string;
  lastIdentifiedAt: string;
  photos: TackleBoxPhoto[];
};

type Props = {
  flyId: string;
  onClose: () => void;
  onRetake: () => void;
  onDelete: (id: string) => void;
  matchingRigTitles: string[];
};

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FlyDetail({ flyId, onClose, onRetake, onDelete, matchingRigTitles }: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/tackle-box/${flyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setNotes(d.notes ?? '');
          const primaryIdx = d.photos.findIndex((p: TackleBoxPhoto) => p.isPrimary);
          setActivePhotoIdx(primaryIdx >= 0 ? primaryIdx : 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [flyId]);

  async function saveNotes() {
    setSavingNotes(true);
    await fetch(`/api/tackle-box/${flyId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    }).catch(() => {});
    setSavingNotes(false);
  }

  async function setPrimary(photoId: string) {
    await fetch(`/api/tackle-box/${flyId}/primary-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    }).catch(() => {});
    const res = await fetch(`/api/tackle-box/${flyId}`);
    const d = await res.json();
    setData(d);
  }

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-page-bg flex items-center justify-center">
        <div className="text-[13px] text-text-muted">Loading…</div>
      </div>
    );
  }

  const photos = data.photos;
  const currentPhoto = photos[activePhotoIdx] ?? photos[0];

  return (
    <div className="fixed inset-0 z-50 bg-page-bg flex flex-col overflow-y-auto">
      <header className="bg-header-bg text-header-text px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center"
        >
          <CloseIcon />
        </button>
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-header-muted">
          {data.category}
        </div>
        <div className="w-[44px]" />
      </header>

      <div className="relative w-full aspect-square bg-card-bg">
        {currentPhoto && (
          <img src={currentPhoto.photoUrl} alt={data.name} className="w-full h-full object-cover" />
        )}
        {photos.length > 1 && (
          <>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  className={`w-2 h-2 rounded-full ${i === activePhotoIdx ? 'bg-white' : 'bg-white/40'}`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
            {currentPhoto && !currentPhoto.isPrimary && (
              <button
                type="button"
                onClick={() => setPrimary(currentPhoto.id)}
                className="absolute top-3 right-3 bg-card-bg/90 backdrop-blur px-2.5 py-1 rounded-[10px] text-[10px] uppercase tracking-[0.12em] font-semibold text-accent-green border border-card-border"
              >
                Set as primary
              </button>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        <div>
          <h2 className="font-display text-[24px] font-semibold text-text-primary leading-tight">
            {data.name}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-0.5 rounded-[12px] bg-fly-dry-bg border border-fly-dry-border text-fly-dry-text text-[10px] font-semibold uppercase">
              {data.role}
            </span>
            {data.size && (
              <span className="text-[12px] text-text-muted font-medium">{data.size}</span>
            )}
          </div>
        </div>

        {data.description && (
          <p className="text-[14px] text-text-secondary leading-relaxed">{data.description}</p>
        )}

        {data.colors && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] font-semibold text-text-muted mb-1">
              Colors
            </div>
            <div className="text-[13px] text-text-primary">{data.colors}</div>
          </div>
        )}

        {matchingRigTitles.length > 0 && (
          <div className="bg-accent-cream rounded-[12px] p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] font-semibold text-text-muted mb-2">
              Used in rigs
            </div>
            <ul className="flex flex-col gap-1">
              {matchingRigTitles.map((title) => (
                <li key={title} className="text-[13px] font-medium text-text-primary">{title}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label
              htmlFor="fly-notes"
              className="text-[10px] uppercase tracking-[0.16em] font-semibold text-text-muted"
            >
              Notes
            </label>
            {notes !== (data.notes ?? '') && (
              <button
                type="button"
                onClick={saveNotes}
                disabled={savingNotes}
                className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent-green min-h-[28px] px-2"
              >
                {savingNotes ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>
          <textarea
            id="fly-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you found it, what worked…"
            rows={3}
            className="w-full bg-accent-cream/50 border border-card-border rounded-[10px] p-3 text-[13px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-sage"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 bg-card-bg rounded-[12px] border border-card-border p-3">
          <div className="text-center">
            <div className="font-display text-[20px] font-semibold text-text-primary">{data.count}</div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-text-muted">Identified</div>
          </div>
          <div className="text-center">
            <div className="text-[12px] font-medium text-text-primary">{formatDate(data.firstIdentifiedAt)}</div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-text-muted">First seen</div>
          </div>
          <div className="text-center">
            <div className="text-[12px] font-medium text-text-primary">{formatDate(data.lastIdentifiedAt)}</div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-text-muted">Last seen</div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 min-h-[48px] rounded-[12px] border border-card-border bg-card-bg text-text-primary text-[13px] font-semibold uppercase tracking-[0.1em]"
          >
            Retake Photo
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[48px] px-4 rounded-[12px] border border-accent-red/30 text-accent-red text-[13px] font-semibold uppercase tracking-[0.1em]"
            >
              Delete
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(flyId)}
              className="min-h-[48px] px-4 rounded-[12px] bg-accent-red text-white text-[13px] font-semibold uppercase tracking-[0.1em]"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
