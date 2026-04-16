import type { Conditions, Hatch, HatchActivity } from '../../data/types';

type Props = {
  value: Conditions;
  onChange: (next: Conditions) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-card-border bg-card-bg text-[14px] text-text-primary focus:outline-none focus:border-accent-sage';

export function ConditionsEditor({ value, onChange }: Props) {
  const set = <K extends keyof Conditions>(k: K, v: Conditions[K]) =>
    onChange({ ...value, [k]: v });

  function setHatch(i: number, patch: Partial<Hatch>) {
    const hatches = value.hatches.map((h, idx) => (idx === i ? { ...h, ...patch } : h));
    onChange({ ...value, hatches });
  }

  function addHatch() {
    const hatches = [...value.hatches, { name: '', sizes: '', activity: 2 as HatchActivity }];
    onChange({ ...value, hatches });
  }

  function removeHatch(i: number) {
    const hatches = value.hatches.filter((_, idx) => idx !== i);
    onChange({ ...value, hatches });
  }

  return (
    <div className="bg-card-bg rounded-[16px] border border-card-border p-4 flex flex-col gap-3">
      <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
        Stream Conditions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Water">
          <input
            className={inputClass}
            value={value.water}
            onChange={(e) => set('water', e.target.value)}
          />
        </Field>
        <Field label="Temp">
          <input
            className={inputClass}
            value={value.temp}
            onChange={(e) => set('temp', e.target.value)}
          />
        </Field>
        <Field label="Flow">
          <input
            className={inputClass}
            value={value.flow ?? ''}
            onChange={(e) => set('flow', e.target.value)}
          />
        </Field>
        <Field label="Clarity">
          <input
            className={inputClass}
            value={value.clarity ?? ''}
            onChange={(e) => set('clarity', e.target.value)}
          />
        </Field>
        <Field label="Trend">
          <input
            className={inputClass}
            value={value.trend ?? ''}
            onChange={(e) => set('trend', e.target.value)}
          />
        </Field>
        <Field label="Tippet">
          <input
            className={inputClass}
            value={value.tippet}
            onChange={(e) => set('tippet', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Approach">
        <textarea
          className={`${inputClass} min-h-[64px] resize-y`}
          value={value.approach}
          onChange={(e) => set('approach', e.target.value)}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Updated">
          <input
            className={inputClass}
            value={value.updated}
            onChange={(e) => set('updated', e.target.value)}
          />
        </Field>
        <Field label="Source">
          <input
            className={inputClass}
            value={value.source}
            onChange={(e) => set('source', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-text-muted">
            Hatches
          </span>
          <button
            type="button"
            onClick={addHatch}
            className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent-green min-h-[32px] px-2"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {value.hatches.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-accent-cream/60 border border-card-border rounded-[10px] p-2"
            >
              <input
                className="flex-1 min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                value={h.name}
                placeholder="Name"
                onChange={(e) => setHatch(i, { name: e.target.value })}
              />
              <input
                className="w-[96px] min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                value={h.sizes}
                placeholder="Sizes"
                onChange={(e) => setHatch(i, { sizes: e.target.value })}
              />
              <select
                className="w-[52px] min-h-[40px] px-1 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                value={h.activity}
                onChange={(e) =>
                  setHatch(i, { activity: Number(e.target.value) as HatchActivity })
                }
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
              <button
                type="button"
                onClick={() => removeHatch(i)}
                aria-label="Remove hatch"
                className="min-w-[36px] min-h-[36px] text-accent-red text-[18px] font-semibold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
