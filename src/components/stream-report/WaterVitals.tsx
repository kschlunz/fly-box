import { useEffect, useState } from 'react';
import type { Conditions } from '../../data/types';

type Props = { conditions: Conditions };

type GaugeData = {
  flow: number | null;
  gaugeHeight: number | null;
  updated: string | null;
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
};

function IconDroplet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fa898" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l5 7a6 6 0 1 1 -10 0z" />
    </svg>
  );
}

function LiveDot() {
  return (
    <span className="relative ml-1.5 inline-flex h-[6px] w-[6px]">
      <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75 animate-ping" />
      <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-accent-green" />
    </span>
  );
}

function trendArrow(trend: string | undefined): { symbol: string; color: string } {
  if (!trend) return { symbol: '—', color: 'text-text-muted' };
  const t = trend.toLowerCase();
  if (t === 'rising' || t.includes('ris')) return { symbol: '↗', color: 'text-accent-green' };
  if (t === 'falling' || t.includes('fall')) return { symbol: '↘', color: 'text-accent-sage' };
  if (t === 'stable' || t === 'steady') return { symbol: '→', color: 'text-text-muted' };
  return { symbol: '—', color: 'text-text-muted' };
}

function trendLabel(trend: string | undefined): string {
  if (!trend) return 'Unknown';
  const t = trend.toLowerCase();
  if (t === 'rising' || t.includes('ris')) return 'Rising';
  if (t === 'falling' || t.includes('fall')) return 'Falling';
  if (t === 'stable' || t === 'steady') return 'Stable';
  return 'Unknown';
}

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff) || diff < 0) return null;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Metric({
  label,
  children,
  subtitle,
  live,
}: {
  label: string;
  children: React.ReactNode;
  subtitle?: string | null;
  live?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-text-muted mb-1 flex items-center">
        {label}
        {live && <LiveDot />}
      </div>
      <div className="text-[20px] font-sans font-semibold text-text-primary leading-tight">
        {children}
      </div>
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

export function WaterVitals({ conditions }: Props) {
  const [gauge, setGauge] = useState<GaugeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/usgs-gauge')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('gauge fetch failed'))))
      .then((d: GaugeData) => {
        if (!cancelled) setGauge(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const liveFlow = gauge?.flow != null;
  const flowDisplay = liveFlow
    ? `${gauge!.flow} cfs`
    : conditions.flow ?? '—';
  const flowSubtitle = liveFlow ? relativeTime(gauge!.updated) : null;

  const liveTrend = gauge != null && gauge.trend !== 'unknown';
  const activeTrend = liveTrend ? gauge!.trend : conditions.trend;
  const { symbol, color } = trendArrow(activeTrend);

  return (
    <div className="relative mx-4 -mt-10 bg-card-bg rounded-[16px] border border-card-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted">
          Water Vitals
        </div>
        <IconDroplet />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Metric label="Flow Rate" live={liveFlow} subtitle={flowSubtitle}>
          {flowDisplay}
        </Metric>
        <Metric label="Temperature">{conditions.temp}</Metric>
        <Metric label="Clarity">{conditions.clarity ?? conditions.water}</Metric>
        <Metric label="Trend">
          <span className="flex items-center gap-1.5">
            <span className={color}>{symbol}</span>
            <span className={color}>{trendLabel(activeTrend)}</span>
          </span>
        </Metric>
      </div>
    </div>
  );
}
