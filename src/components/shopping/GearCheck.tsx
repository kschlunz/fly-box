import type { GearItem } from '../../data/types';

type Props = {
  items: GearItem[];
  checks: Record<string, boolean>;
  onToggle: (name: string) => void;
};

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <div className="w-6 h-6 rounded-[6px] bg-accent-sage flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2efe8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  return <div className="w-6 h-6 rounded-[6px] border-2 border-card-border bg-card-bg" />;
}

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7fa898"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17l8 -4l8 4" />
      <path d="M4 12l8 -4l8 4" />
      <path d="M4 7l8 -4l8 4" />
    </svg>
  );
}

export function GearCheck({ items, checks, onToggle }: Props) {
  const checkedCount = items.filter((it) => checks[it.name]).length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
          Gear Check
        </h3>
        <div className="text-[11px] text-text-muted font-medium">
          {checkedCount}/{items.length}
        </div>
      </div>
      <div className="bg-accent-cream rounded-[16px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <GearIcon />
          <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-text-secondary">
            Don't forget
          </div>
        </div>
        <ul className="flex flex-col gap-1">
          {items.map((item, i) => {
            const checked = !!checks[item.name];
            return (
              <li key={`${item.name}-${i}`}>
                <button
                  type="button"
                  onClick={() => onToggle(item.name)}
                  aria-pressed={checked}
                  className="w-full flex items-center gap-3 py-2 min-h-[44px] text-left"
                >
                  <CheckboxIcon checked={checked} />
                  <span
                    className={`text-[14px] ${
                      checked
                        ? 'text-text-muted line-through'
                        : 'text-text-primary font-medium'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
