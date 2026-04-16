import type { Conditions } from '../../data/types';

type Props = { conditions: Conditions };

function IconDroplet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fa898" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l5 7a6 6 0 1 1 -10 0z" />
    </svg>
  );
}

function TrendArrow({ trend }: { trend?: string }) {
  if (!trend) return null;
  const t = trend.toLowerCase();
  const arrow = t.includes('ris') ? '↗' : t.includes('fall') ? '↘' : '→';
  return <span className="text-accent-sage">{arrow}</span>;
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-text-muted mb-1">
        {label}
      </div>
      <div className="text-[20px] font-sans font-semibold text-text-primary leading-tight">
        {children}
      </div>
    </div>
  );
}

export function WaterVitals({ conditions }: Props) {
  return (
    <div className="relative mx-4 -mt-10 bg-card-bg rounded-[16px] border border-card-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted">
          Water Vitals
        </div>
        <IconDroplet />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Metric label="Flow Rate">{conditions.flow ?? '—'}</Metric>
        <Metric label="Temperature">{conditions.temp}</Metric>
        <Metric label="Clarity">{conditions.clarity ?? conditions.water}</Metric>
        <Metric label="Trend">
          <span className="flex items-center gap-1.5">
            <TrendArrow trend={conditions.trend} />
            <span className={conditions.trend ? 'text-accent-sage' : ''}>
              {conditions.trend ?? 'Steady'}
            </span>
          </span>
        </Metric>
      </div>
    </div>
  );
}
