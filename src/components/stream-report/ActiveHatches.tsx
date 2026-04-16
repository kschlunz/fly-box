import type { Hatch } from '../../data/types';

type Props = { hatches: Hatch[] };

function IconFly() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fa898" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0 -4 -3 -6 -6 -6" />
      <path d="M12 10c0 -4 3 -6 6 -6" />
      <path d="M12 14c0 3 -2 5 -5 5" />
      <path d="M12 14c0 3 2 5 5 5" />
    </svg>
  );
}

function ActivityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`block w-1.5 h-1.5 rounded-full ${
            i <= level ? 'bg-accent-green' : 'bg-card-border'
          }`}
        />
      ))}
    </div>
  );
}

export function ActiveHatches({ hatches }: Props) {
  return (
    <div className="mx-4 bg-card-bg rounded-[16px] border border-card-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted">
          Active Hatches
        </div>
        <IconFly />
      </div>
      <ul className="flex flex-col">
        {hatches.map((h, i) => (
          <li
            key={`${h.name}-${i}`}
            className={`flex items-center justify-between py-3 ${
              i < hatches.length - 1 ? 'border-b border-card-border' : ''
            }`}
          >
            <div>
              <div className="text-[16px] font-semibold text-text-primary leading-tight">
                {h.name}
              </div>
              <div className="text-[12px] text-text-muted mt-0.5">{h.sizes}</div>
            </div>
            <ActivityDots level={h.activity} />
          </li>
        ))}
      </ul>
    </div>
  );
}
