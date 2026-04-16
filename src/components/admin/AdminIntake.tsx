import { useState } from 'react';
import type {
  Conditions,
  Rig,
  ShoppingCategory,
  ShoppingItem,
} from '../../data/types';
import { getStoredAdminPass } from '../layout/AdminGate';
import { ConditionsEditor } from './ConditionsEditor';
import { RigEditor } from './RigEditor';

type SourceOption = 'auto' | 'DRO' | 'Headwaters' | 'Other';

type ParseResponse = {
  source?: string;
  conditions: Conditions;
  rigs: Rig[];
  shopping: ShoppingItem[];
};

type PublishState = 'idle' | 'publishing' | 'success' | 'error';

const categoryOptions: ShoppingCategory[] = ['dry', 'nymph', 'soft-hackle', 'streamer', 'other'];

const inputClass =
  'w-full min-h-[44px] px-3 py-2 rounded-[10px] border border-card-border bg-card-bg text-[14px] text-text-primary focus:outline-none focus:border-accent-sage';

export function AdminIntake() {
  const [source, setSource] = useState<SourceOption>('auto');
  const [detectedSource, setDetectedSource] = useState<string | null>(null);
  const [report, setReport] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [conditions, setConditions] = useState<Conditions | null>(null);
  const [rigs, setRigs] = useState<Rig[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);

  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);

  async function handleParse() {
    if (!report.trim()) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch('/api/parse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          currentDate: new Date().toISOString().slice(0, 10),
          source,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Parse failed (${res.status})`);
      }
      const data = (await res.json()) as ParseResponse;
      setDetectedSource(data.source ?? null);
      setConditions(data.conditions);
      setRigs(data.rigs);
      setShopping(data.shopping);
      setPublishState('idle');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Parse failed');
    } finally {
      setParsing(false);
    }
  }

  async function handlePublish() {
    if (!conditions) return;
    setPublishState('publishing');
    setPublishError(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pass': getStoredAdminPass() ?? '',
        },
        body: JSON.stringify({ conditions, rigs, shopping }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Publish failed (${res.status})`);
      }
      setPublishState('success');
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
    }
  }

  function updateRig(i: number, next: Rig) {
    setRigs(rigs.map((r, idx) => (idx === i ? next : r)));
  }

  function removeRig(i: number) {
    setRigs(rigs.filter((_, idx) => idx !== i));
  }

  function updateShopping(i: number, patch: Partial<ShoppingItem>) {
    setShopping(shopping.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function removeShoppingItem(i: number) {
    setShopping(shopping.filter((_, idx) => idx !== i));
  }

  function goHome() {
    window.location.hash = '';
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <header className="bg-header-bg text-header-text px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-header-muted">
            Admin
          </div>
          <h1 className="font-display text-[22px] font-semibold leading-tight">
            Report Intake
          </h1>
        </div>
        <button
          type="button"
          onClick={goHome}
          className="min-h-[40px] px-3 rounded-[10px] bg-header-text/10 text-header-text text-[11px] uppercase tracking-[0.14em] font-semibold"
        >
          Back to app
        </button>
      </header>

      <main className="px-4 py-5 flex flex-col gap-5 pb-24">
        <section className="bg-card-bg rounded-[16px] border border-card-border p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-text-muted">
                Report Source
              </span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as SourceOption)}
                className={inputClass}
              >
                <option value="auto">Auto-detect</option>
                <option value="DRO">Davidson River Outfitters</option>
                <option value="Headwaters">Headwaters Outfitters</option>
                <option value="Other">Other / Manual</option>
              </select>
            </label>
            <div className="flex gap-2">
              <a
                href="https://www.davidsonflyfishing.com/stream-report"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[40px] rounded-[10px] border border-card-border bg-accent-cream text-text-secondary text-[11px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-1"
              >
                Open DRO report ↗
              </a>
              <a
                href="https://headwatersoutfitters.com/river-reports/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[40px] rounded-[10px] border border-card-border bg-accent-cream text-text-secondary text-[11px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-1"
              >
                Open Headwaters ↗
              </a>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
              Paste report
            </h2>
            <span className="text-[11px] text-text-muted">{report.length} chars</span>
          </div>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Paste the full Davidson River report here — shop post, email, anything structured enough to parse."
            rows={8}
            className={`${inputClass} min-h-[200px] resize-y leading-relaxed`}
          />
          <button
            type="button"
            disabled={parsing || !report.trim()}
            onClick={handleParse}
            className="min-h-[48px] rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {parsing ? 'Parsing…' : 'Parse Report'}
          </button>
          {parseError && (
            <div className="text-[13px] text-accent-red">{parseError}</div>
          )}
        </section>

        {detectedSource && (
          <div className="flex items-center gap-2">
            <span className="inline-flex px-3 py-1 rounded-[14px] bg-accent-green text-header-text text-[10px] uppercase tracking-[0.14em] font-semibold">
              Parsed from: {detectedSource === 'DRO' ? 'Davidson River Outfitters' : detectedSource === 'Headwaters' ? 'Headwaters Outfitters' : 'Other'}
            </span>
          </div>
        )}

        {conditions && (
          <ConditionsEditor value={conditions} onChange={setConditions} />
        )}

        {rigs.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted px-1">
              Rigs ({rigs.length})
            </h2>
            {rigs.map((r, i) => (
              <RigEditor
                key={r.id || i}
                value={r}
                onChange={(next) => updateRig(i, next)}
                onRemove={() => removeRig(i)}
              />
            ))}
          </section>
        )}

        {shopping.length > 0 && (
          <section className="bg-card-bg rounded-[16px] border border-card-border p-4 flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-text-muted">
              Shopping ({shopping.length})
            </h2>
            <div className="flex flex-col gap-2">
              {shopping.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className="flex flex-col gap-2 bg-accent-cream/60 border border-card-border rounded-[10px] p-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                      value={s.name}
                      placeholder="Name"
                      onChange={(e) => updateShopping(i, { name: e.target.value })}
                    />
                    <input
                      className="w-[120px] min-h-[40px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[13px]"
                      value={s.sizes}
                      placeholder="Sizes"
                      onChange={(e) => updateShopping(i, { sizes: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeShoppingItem(i)}
                      aria-label="Remove item"
                      className="min-w-[36px] min-h-[36px] text-accent-red text-[18px] font-semibold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="w-[120px] min-h-[36px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[12px]"
                      value={s.category}
                      onChange={(e) =>
                        updateShopping(i, { category: e.target.value as ShoppingCategory })
                      }
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={9}
                      className="w-[60px] min-h-[36px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[12px]"
                      value={s.quantity ?? 3}
                      onChange={(e) =>
                        updateShopping(i, { quantity: Number(e.target.value) })
                      }
                    />
                    <input
                      className="flex-1 min-h-[36px] px-2 rounded-[8px] border border-card-border bg-card-bg text-[12px] italic"
                      value={s.descriptor ?? ''}
                      placeholder="Descriptor"
                      onChange={(e) => updateShopping(i, { descriptor: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {conditions && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState === 'publishing' || publishState === 'success'}
              className="min-h-[52px] rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
            >
              {publishState === 'publishing' && 'Publishing…'}
              {publishState === 'success' && '✓ Published'}
              {(publishState === 'idle' || publishState === 'error') && 'Publish to App'}
            </button>
            {publishState === 'error' && publishError && (
              <div className="text-[13px] text-accent-red">{publishError}</div>
            )}
            {publishState === 'success' && (
              <div className="text-[13px] text-accent-green">
                Published. The app now reflects this report.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
