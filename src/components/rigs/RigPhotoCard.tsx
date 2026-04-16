import { useState } from 'react';
import type { Rig } from '../../data/types';
import { FlyPairingPills } from './FlyPairingPills';

type Props = {
  rig: Rig;
  isSaved: boolean;
  onToggleSave: () => void;
  note: string;
  onNoteChange: (value: string) => void;
};

function HookPlaceholder() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2c5a42"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    >
      <path d="M12 3v14" />
      <path d="M12 17a5 5 0 0 1 -5 -5" />
      <circle cx="12" cy="3" r="1.5" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? '#c8a020' : 'none'}
      stroke={filled ? '#c8a020' : '#a09a8e'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function RigPhotoCard({ rig, isSaved, onToggleSave, note, onNoteChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-card-bg rounded-[16px] border border-card-border overflow-hidden">
      <div className="relative">
        <div className="w-full h-[200px] rig-photo-fallback flex items-center justify-center">
          <HookPlaceholder />
        </div>
        {rig.hot && (
          <span className="absolute top-3 left-3 bg-accent-red text-white text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-[14px]">
            Hot
          </span>
        )}
        <span className="absolute top-3 right-3 bg-card-bg/90 backdrop-blur text-text-secondary text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-[14px] border border-card-border">
          {rig.label}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[20px] font-semibold text-text-primary leading-tight flex-1">
            {rig.title}
          </h3>
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save rig'}
            className="shrink-0 min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center"
          >
            <StarIcon filled={isSaved} />
          </button>
        </div>

        {rig.description && (
          <p className="text-[14px] text-text-secondary leading-relaxed">{rig.description}</p>
        )}

        <FlyPairingPills flies={rig.flies} />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-accent-green min-h-[36px] -mx-1 px-1"
        >
          <span>{expanded ? 'Hide Details' : 'View Details'}</span>
          <ChevronIcon open={expanded} />
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
                  When to Fish
                </div>
                <div className="text-[13px] text-text-primary">{rig.when}</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
                  Field Tip
                </div>
                <p className="text-[13px] italic text-text-secondary leading-relaxed">{rig.tip}</p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
                  Full Rig
                </div>
                <ul className="flex flex-col gap-1">
                  {rig.flies.map((fly, i) => (
                    <li
                      key={`${fly.name}-${i}`}
                      className="text-[13px] text-text-primary flex items-baseline gap-2"
                    >
                      <span className="text-text-muted font-medium w-4">{i + 1}.</span>
                      <span className="font-semibold">{fly.name}</span>
                      <span className="text-text-muted">{fly.size}</span>
                      {fly.descriptor && (
                        <span className="italic text-text-secondary text-[12px]">
                          {fly.descriptor}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label
                  htmlFor={`note-${rig.id}`}
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted"
                >
                  Personal Notes
                </label>
                <textarea
                  id={`note-${rig.id}`}
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="What worked, what didn't..."
                  rows={3}
                  className="w-full bg-accent-cream/50 border border-card-border rounded-[10px] p-3 text-[13px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-sage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
