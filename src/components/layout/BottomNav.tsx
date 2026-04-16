export type Tab = 'stream-report' | 'rigs' | 'shopping';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

function IconStream({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M3 7c2.5 -1.8 5 -1.8 7.5 0s5 1.8 7.5 0s3 0 3 0" />
      <path d="M3 12c2.5 -1.8 5 -1.8 7.5 0s5 1.8 7.5 0s3 0 3 0" />
      <path d="M3 17c2.5 -1.8 5 -1.8 7.5 0s5 1.8 7.5 0s3 0 3 0" />
    </svg>
  );
}

function IconRigs({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v14" />
      <path d="M12 17a4 4 0 0 1 -4 -4" />
      <circle cx="12" cy="3" r="1.5" />
    </svg>
  );
}

function IconShopping({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1.5 11a2 2 0 0 1 -2 1.8h-7a2 2 0 0 1 -2 -1.8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'stream-report', label: 'STREAM REPORT' },
  { id: 'rigs', label: 'RIGS' },
  { id: 'shopping', label: 'SHOPPING' },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-card-bg border-t border-card-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto max-w-[480px] h-16 px-2 flex items-stretch justify-around">
        {tabs.map((t) => {
          const isActive = active === t.id;
          const color = isActive ? '#2c5a42' : '#a09a8e';

          if (t.id === 'rigs' && isActive) {
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1"
                aria-current="page"
              >
                <span className="w-11 h-11 rounded-full bg-accent-green flex items-center justify-center -mt-6 shadow-[0_4px_12px_rgba(44,90,66,0.35)]">
                  <IconRigs color="#ffffff" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] text-accent-green">
                  {t.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1"
              aria-current={isActive ? 'page' : undefined}
            >
              {t.id === 'stream-report' && <IconStream color={color} />}
              {t.id === 'rigs' && <IconRigs color={color} />}
              {t.id === 'shopping' && <IconShopping color={color} />}
              <span
                className={`text-[10px] tracking-[0.14em] ${
                  isActive ? 'font-semibold text-accent-green' : 'font-medium text-text-muted'
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
