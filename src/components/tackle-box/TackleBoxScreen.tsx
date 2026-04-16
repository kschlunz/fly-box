import { useMemo, useState } from 'react';
import type { Rig, TackleBoxFly } from '../../data/types';
import { HeroHeader } from '../stream-report/HeroHeader';
import { FlyCard } from './FlyCard';
import { FlyDetail } from './FlyDetail';

type TackleFilter = 'all' | 'dry' | 'nymph' | 'streamer' | 'soft-hackle' | 'recent';

type Props = {
  flies: TackleBoxFly[];
  rigs: Rig[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCamera: () => void;
};

const filters: { id: TackleFilter; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'dry', label: 'DRY' },
  { id: 'nymph', label: 'NYMPH' },
  { id: 'streamer', label: 'STREAMER' },
  { id: 'soft-hackle', label: 'HACKLE' },
  { id: 'recent', label: 'RECENT' },
];

const roleToFilter: Record<string, TackleFilter> = {
  dry: 'dry',
  dropper: 'nymph',
  anchor: 'nymph',
  point: 'nymph',
  soft: 'soft-hackle',
  streamer: 'streamer',
};

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function EmptyState({ onOpenCamera }: { onOpenCamera: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 pt-12 px-8">
      <div className="w-20 h-20 rounded-full bg-accent-cream border border-card-border flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2c5a42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10c0 -4 -3 -6 -6 -6" />
          <path d="M12 10c0 -4 3 -6 6 -6" />
          <path d="M12 14c0 3 -2 5 -5 5" />
          <path d="M12 14c0 3 2 5 5 5" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[22px] font-semibold text-text-primary">
          Your tackle box is empty
        </h2>
        <p className="text-[14px] text-text-secondary">
          Tap the camera button below to identify your first fly.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenCamera}
        className="min-h-[48px] px-8 rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.1em] animate-pulse"
      >
        Identify a Fly
      </button>
    </div>
  );
}

export function TackleBoxScreen({ flies, rigs, loading, onRefresh, onOpenCamera }: Props) {
  const [filter, setFilter] = useState<TackleFilter>('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return flies;
    if (filter === 'recent') {
      return [...flies].sort(
        (a, b) => new Date(b.lastIdentifiedAt).getTime() - new Date(a.lastIdentifiedAt).getTime()
      ).slice(0, 20);
    }
    return flies.filter((f) => roleToFilter[f.role] === filter);
  }, [flies, filter]);

  const categories = useMemo(() => {
    const map = new Map<string, TackleBoxFly[]>();
    for (const f of filtered) {
      const cat = f.category || 'other';
      const arr = map.get(cat) ?? [];
      arr.push(f);
      map.set(cat, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const mostRecent = flies.length > 0
    ? [...flies].sort((a, b) =>
        new Date(b.lastIdentifiedAt).getTime() - new Date(a.lastIdentifiedAt).getTime()
      )[0]
    : null;

  const favorite = flies.length > 0
    ? [...flies].sort((a, b) => b.count - a.count)[0]
    : null;

  const matchingRigsForFly = (flyId: string) => {
    const fly = flies.find((f) => f.id === flyId);
    if (!fly) return [];
    const norm = normalizeName(fly.name);
    return rigs
      .filter((r) => r.flies.some((f) => {
        const n = normalizeName(f.name);
        return n === norm || n.includes(norm) || norm.includes(n);
      }))
      .map((r) => r.title);
  };

  function handleDelete(id: string) {
    const pass = sessionStorage.getItem('davidson-fly-box-admin') || localStorage.getItem('davidson-admin-pass');
    if (!pass) {
      const entered = window.prompt('Admin passphrase:');
      if (!entered) return;
      localStorage.setItem('davidson-admin-pass', entered);
      doDelete(id, entered);
      return;
    }
    doDelete(id, pass);
  }

  function doDelete(id: string, pass: string) {
    fetch(`/api/tackle-box/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pass': pass },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Delete failed');
        setDetailId(null);
        onRefresh();
      })
      .catch(() => {
        localStorage.removeItem('davidson-admin-pass');
      });
  }

  return (
    <>
      <HeroHeader
        label="My collection"
        title="Tackle Box"
        subtitle={flies.length > 0 ? `${flies.length} flies · ${categories.length} categories` : undefined}
        variant="short"
      />

      {flies.length === 0 && !loading ? (
        <EmptyState onOpenCamera={onOpenCamera} />
      ) : (
        <>
          <div className="bg-page-bg px-4 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 min-h-[36px] px-4 rounded-[24px] text-[11px] tracking-[0.12em] whitespace-nowrap transition-colors ${
                    filter === f.id
                      ? 'bg-accent-green text-header-text font-semibold'
                      : 'bg-card-bg text-text-secondary border border-card-border font-medium'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {flies.length > 0 && filter === 'all' && (
            <div className="mx-4 mt-2 bg-accent-cream rounded-[16px] p-4 flex flex-col gap-2">
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
                Collection Stats
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[28px] font-semibold text-text-primary">{flies.length}</span>
                <span className="text-[12px] text-text-muted">flies</span>
                <span className="text-text-muted">·</span>
                <span className="text-[12px] text-text-muted">{categories.length} categories</span>
              </div>
              {mostRecent && (
                <div className="text-[12px] text-text-secondary">
                  Most recent: <span className="font-semibold">{mostRecent.name}</span>
                </div>
              )}
              {favorite && favorite.count > 1 && (
                <div className="text-[12px] text-text-secondary">
                  Favorite: <span className="font-semibold">{favorite.name}</span> (×{favorite.count})
                </div>
              )}
            </div>
          )}

          <section className="px-4 pt-3 pb-28 flex flex-col gap-5">
            {categories.map(([category, categoryFlies]) => (
              <div key={category} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between px-1">
                  <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
                    {category}
                  </h3>
                  <span className="text-[11px] text-text-muted">{categoryFlies.length} flies</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {categoryFlies.map((fly) => (
                    <FlyCard key={fly.id} fly={fly} onTap={() => setDetailId(fly.id)} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {detailId && (
        <FlyDetail
          flyId={detailId}
          onClose={() => setDetailId(null)}
          onRetake={() => {
            setDetailId(null);
            onOpenCamera();
          }}
          onDelete={handleDelete}
          matchingRigTitles={matchingRigsForFly(detailId)}
        />
      )}
    </>
  );
}
