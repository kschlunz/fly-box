import type { Fly, FlyRole } from '../../data/types';

type Props = { flies: Fly[] };

const roleTint: Record<FlyRole, { bg: string; border: string; text: string }> = {
  dry: { bg: 'bg-fly-dry-bg', border: 'border-fly-dry-border', text: 'text-fly-dry-text' },
  point: { bg: 'bg-fly-dry-bg', border: 'border-fly-dry-border', text: 'text-fly-dry-text' },
  dropper: { bg: 'bg-fly-dropper-bg', border: 'border-fly-dropper-border', text: 'text-fly-dropper-text' },
  anchor: { bg: 'bg-fly-dropper-bg', border: 'border-fly-dropper-border', text: 'text-fly-dropper-text' },
  soft: { bg: 'bg-fly-soft-bg', border: 'border-fly-soft-border', text: 'text-fly-soft-text' },
  streamer: { bg: 'bg-fly-streamer-bg', border: 'border-fly-streamer-border', text: 'text-fly-streamer-text' },
};

export function FlyPairingPills({ flies }: Props) {
  const pair = flies.slice(0, 2);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {pair.map((fly, i) => {
        const tint = roleTint[fly.role];
        return (
          <div key={`${fly.name}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-text-muted text-[11px] font-medium" aria-hidden>
                +
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[16px] border ${tint.bg} ${tint.border} ${tint.text} text-[11px] font-semibold`}
            >
              <span className="truncate max-w-[140px]">{fly.name}</span>
              <span className="opacity-70 font-medium">{fly.size}</span>
            </span>
          </div>
        );
      })}
      {flies.length > 2 && (
        <span className="text-[11px] text-text-muted font-medium">+{flies.length - 2}</span>
      )}
    </div>
  );
}
