import type { Conditions } from '../../data/types';

type Props = {
  conditions: Conditions;
  onViewForecast?: () => void;
};

function strategyTitleFor(conditions: Conditions): string {
  const trend = conditions.trend?.toLowerCase() ?? '';
  if (trend.includes('fall')) return 'Stealth & Technical Drifts';
  if (trend.includes('ris')) return 'Opportunity in Off-Color Water';
  if (conditions.water.toLowerCase().includes('low')) return 'Long Leaders & Light Presentations';
  return 'Patience and Presentation';
}

export function StrategyCard({ conditions, onViewForecast }: Props) {
  const title = strategyTitleFor(conditions);

  return (
    <div className="mx-4 bg-accent-cream rounded-[16px] p-5 flex flex-col gap-4">
      <div className="self-start inline-flex items-center bg-accent-green text-header-text px-3 py-1 rounded-[20px] text-[10px] uppercase tracking-[0.14em] font-semibold">
        Recommended Strategy
      </div>
      <h2 className="font-display italic font-semibold text-[22px] leading-tight text-text-primary">
        {title}
      </h2>
      <p className="text-[14px] text-text-secondary leading-relaxed">{conditions.approach}</p>
      <div className="text-[12px] text-text-muted italic">
        Tippet: {conditions.tippet}
      </div>
      <button
        type="button"
        onClick={onViewForecast}
        className="w-full min-h-[48px] rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.1em]"
      >
        View Full Forecast
      </button>
    </div>
  );
}
