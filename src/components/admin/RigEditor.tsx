import type { Fly, FlyRole, Rig, Section } from '../../data/types';

type Props = {
  value: Rig;
  onChange: (next: Rig) => void;
  onRemove: () => void;
};

const sectionOptions: Section[] = ['dry-dropper', 'euro', 'soft-hackle', 'streamer'];
const roleOptions: FlyRole[] = ['dry', 'dropper', 'anchor', 'point', 'soft', 'streamer'];

const inputClass =
  'w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-card-border bg-card-bg text-[14px] text-text-primary focus:outline-none focus:border-accent-sage';

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

export function RigEditor({ value, onChange, onRemove }: Props) {
  const set = <K extends keyof Rig>(k: K, v: Rig[K]) => onChange({ ...value, [k]: v });

  function setFly(i: number, patch: Partial<Fly>) {
    const flies = value.flies.map((f, idx) => (idx === i ? { ...f, ...patch } : f));
    onChange({ ...value, flies });
  }

  function addFly() {
    const flies = [...value.flies, { name: '', size: '', role: 'dry' as FlyRole }];
    onChange({ ...value, flies });
  }

  function removeFly(i: number) {
    onChange({ ...value, flies: value.flies.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="bg-card-bg rounded-[16px] border border-card-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-text-muted">
            Rig {value.id}
          </span>
          {value.hot && (
            <span className="bg-accent-red text-white text-[9px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 rounded-[10px]">
              Hot
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent-red min-h-[32px] px-2"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Section">
          <select
            className={inputClass}
            value={value.section}
            onChange={(e) => set('section', e.target.value as Section)}
          >
            {sectionOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="When">
          <input
            className={inputClass}
            value={value.when}
            onChange={(e) => set('when', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Label">
        <input
          className={inputClass}
          value={value.label}
          onChange={(e) => set('label', e.target.value)}
        />
      </Field>

      <Field label="Title">
        <input
          className={inputClass}
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>

      <Field label="Description">
        <textarea
          className={`${inputClass} min-h-[64px] resize-y`}
          value={value.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
        />
      </Field>

      <Field label="Tip">
        <textarea
          className={`${inputClass} min-h-[64px] resize-y`}
          value={value.tip}
          onChange={(e) => set('tip', e.target.value)}
          rows={2}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-text-muted">
            Flies
          </span>
          <button
            type="button"
            onClick={addFly}
            className="text-[11px] uppercase tracking-[0.12em] font-semibold text-accent-green min-h-[32px] px-2"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {value.flies.map((f, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 bg-accent-cream/60 border border-card-border rounded-[10px] p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                  value={f.name}
                  placeholder="Fly name"
                  onChange={(e) => setFly(i, { name: e.target.value })}
                />
                <input
                  className="w-[80px] min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                  value={f.size}
                  placeholder="Size"
                  onChange={(e) => setFly(i, { size: e.target.value })}
                />
                <select
                  className="w-[92px] min-h-[40px] px-1 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                  value={f.role}
                  onChange={(e) => setFly(i, { role: e.target.value as FlyRole })}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeFly(i)}
                  aria-label="Remove fly"
                  className="min-w-[36px] min-h-[36px] text-accent-red text-[18px] font-semibold"
                >
                  ×
                </button>
              </div>
              <input
                className="w-full min-h-[36px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[12px] italic"
                value={f.descriptor ?? ''}
                placeholder="Descriptor (optional)"
                onChange={(e) => setFly(i, { descriptor: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          checked={!!value.hot}
          onChange={(e) => set('hot', e.target.checked)}
          className="w-4 h-4 accent-accent-green"
        />
        <span className="text-[12px] text-text-secondary">
          Mark as <strong>#1 rig this week</strong>
        </span>
      </label>
    </div>
  );
}
