type Props = {
  packed: number;
  total: number;
};

export function ShoppingHeader({ packed, total }: Props) {
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
  return (
    <div className="bg-page-bg px-4 pt-4 pb-2">
      <div className="bg-card-bg rounded-[16px] border border-card-border p-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">
            Box Progress
          </div>
          <div className="text-[12px] text-text-secondary font-medium">
            <span className="text-text-primary font-semibold">{packed}</span> of {total} packed
          </div>
        </div>
        <div className="h-2 bg-accent-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-green rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}
