import type { Fly, Rig } from '../../data/types';

type Props = { rig: Rig };

const roleLabel: Record<Fly['role'], string> = {
  dry: 'TOP FLY (DRY)',
  dropper: 'TRAILER FLY (NYMPH)',
  anchor: 'ANCHOR FLY',
  point: 'POINT FLY',
  soft: 'SWING FLY',
  streamer: 'STREAMER',
};

function HookBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] border border-card-border text-[10px] uppercase tracking-[0.14em] font-semibold text-text-secondary">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="M12 15a4 4 0 0 1 -4 -4" />
      </svg>
      Featured Rig
    </div>
  );
}

function FlyRow({
  fly,
  index,
  tint,
}: {
  fly: Fly;
  index: number;
  tint: 'green' | 'sage';
}) {
  const bg = tint === 'green' ? 'bg-accent-green' : 'bg-accent-sage';
  return (
    <div className="flex items-start gap-3">
      <div
        className={`${bg} text-header-text w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 mt-0.5`}
      >
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-text-muted">
          {roleLabel[fly.role]}
        </div>
        <div className="text-[17px] font-semibold text-text-primary leading-tight">
          {fly.name} <span className="text-text-muted font-medium">{fly.size}</span>
        </div>
        {fly.descriptor && (
          <div className="text-[13px] italic text-text-secondary mt-0.5">{fly.descriptor}</div>
        )}
      </div>
    </div>
  );
}

export function FeaturedRig({ rig }: Props) {
  return (
    <div className="mx-4 bg-card-bg rounded-[16px] border border-card-border overflow-hidden">
      <div className="p-5 flex flex-col gap-4">
        <HookBadge />
        <h2 className="font-display text-[24px] font-semibold text-text-primary leading-tight">
          {rig.title}
        </h2>

        <div className="flex flex-col gap-3.5">
          {rig.flies.slice(0, 2).map((fly, i) => (
            <FlyRow
              key={`${fly.name}-${i}`}
              fly={fly}
              index={i + 1}
              tint={i === 0 ? 'green' : 'sage'}
            />
          ))}
        </div>

        <p className="text-[13px] italic text-text-secondary leading-relaxed">{rig.tip}</p>
      </div>
      <div className="mx-4 mb-4 rounded-[12px] h-40 rig-photo-fallback flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7fa898"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        >
          <path d="M12 3v14" />
          <path d="M12 17a5 5 0 0 1 -5 -5" />
          <circle cx="12" cy="3" r="1.5" />
        </svg>
      </div>
    </div>
  );
}
