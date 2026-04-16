import type { Section } from '../../data/types';

export type RigFilter = 'all' | 'saved' | Section;

const tabs: { id: RigFilter; label: string }[] = [
  { id: 'all', label: 'ALL RIGS' },
  { id: 'saved', label: 'SAVED' },
  { id: 'dry-dropper', label: 'DRY-DROPPER' },
  { id: 'euro', label: 'EURO' },
  { id: 'soft-hackle', label: 'SOFT HACKLE' },
  { id: 'streamer', label: 'STREAMER' },
];

type Props = {
  active: RigFilter;
  onChange: (f: RigFilter) => void;
  savedCount: number;
};

export function FilterTabs({ active, onChange, savedCount }: Props) {
  return (
    <div className="bg-page-bg px-4 pt-3 pb-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {tabs.map((t) => {
          const isActive = active === t.id;
          const showCount = t.id === 'saved' && savedCount > 0;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`shrink-0 min-h-[36px] px-4 rounded-[24px] text-[11px] tracking-[0.12em] whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-accent-green text-header-text font-semibold'
                  : 'bg-card-bg text-text-secondary border border-card-border font-medium'
              }`}
            >
              {t.label}
              {showCount && (
                <span
                  className={`ml-1.5 text-[10px] ${isActive ? 'opacity-85' : 'opacity-60'}`}
                >
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
