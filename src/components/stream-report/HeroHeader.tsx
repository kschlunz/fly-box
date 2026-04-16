type Props = {
  label: string;
  title: string;
  subtitle?: string;
  variant?: 'tall' | 'short';
};

function IconMenu({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function IconBell({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 4 2 5 2 7H4c0 -2 2 -3 2 -7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function HeroHeader({ label, title, subtitle, variant = 'tall' }: Props) {
  const minHeight = variant === 'tall' ? 260 : 160;

  return (
    <header
      className="relative bg-header-bg text-header-text px-5 pt-6 overflow-hidden"
      style={{ minHeight, paddingBottom: variant === 'tall' ? 64 : 24 }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(127, 168, 152, 0.25) 0%, rgba(26, 46, 36, 0) 60%), linear-gradient(to bottom, #24403200 0%, #1a2e24 100%), #1a2e24',
        }}
      />

      <div className="relative flex items-center justify-between">
        <button
          type="button"
          aria-label="Menu"
          className="w-11 h-11 -ml-2 flex items-center justify-center"
        >
          <IconMenu color="#f2efe8" />
        </button>
        <div className="font-display italic text-[15px] text-header-text">Field Journal</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notifications"
            className="w-11 h-11 flex items-center justify-center"
          >
            <IconBell color="#f2efe8" />
          </button>
          <div
            aria-hidden
            className="w-9 h-9 rounded-full bg-header-card-bg border border-white/20 flex items-center justify-center text-[12px] font-semibold text-header-text"
          >
            KS
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-header-muted mb-2">
          {label}
        </div>
        <h1 className="font-display text-[32px] font-bold leading-[1.1] text-header-text">
          {title}
        </h1>
        {subtitle && (
          <div className="text-[13px] text-header-muted mt-1">{subtitle}</div>
        )}
      </div>
    </header>
  );
}
