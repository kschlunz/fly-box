import { useMemo, useRef, useState } from 'react';
import type { FlyRole, Rig } from '../../data/types';

type Confidence = 'high' | 'medium' | 'low';

type IdentifyResult = {
  name: string;
  sizeRange: string;
  role: FlyRole;
  confidence: Confidence;
  notes: string;
  alternates: string[];
};

type Props = {
  rigs: Rig[];
  onClose: () => void;
};

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(blob);
  });

  return { base64, mediaType: 'image/jpeg' };
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findMatchingRigs(rigs: Rig[], flyName: string): Rig[] {
  const target = normalizeName(flyName).trim();
  if (!target) return [];
  return rigs.filter((r) =>
    r.flies.some((f) => {
      const n = normalizeName(f.name);
      if (!n) return false;
      return n === target || n.includes(target) || target.includes(n);
    })
  );
}

function confidenceStyles(c: Confidence): { bg: string; text: string; label: string } {
  if (c === 'high') return { bg: 'bg-accent-green', text: 'text-header-text', label: 'High confidence' };
  if (c === 'medium') return { bg: 'bg-accent-amber', text: 'text-header-text', label: 'Medium confidence' };
  return { bg: 'bg-accent-red', text: 'text-header-text', label: 'Low confidence' };
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1 -2 2h-18a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l2 -3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function FlyIdentifier({ rigs, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);

  const matches = useMemo(
    () => (result ? findMatchingRigs(rigs, result.name) : []),
    [result, rigs]
  );

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setLoading(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const { base64, mediaType } = await compressImage(file);
      const res = await fetch('/api/identify-fly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as IdentifyResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identification failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 bg-page-bg flex flex-col">
      <header className="bg-header-bg text-header-text px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close fly identifier"
          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-header-text"
        >
          <CloseIcon />
        </button>
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-header-muted">
          Identify
        </div>
        <div className="w-[44px]" aria-hidden />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {!previewUrl && !result && (
          <div className="flex flex-col items-center text-center gap-4 pt-8">
            <div className="w-20 h-20 rounded-full bg-accent-cream border border-card-border flex items-center justify-center text-accent-green">
              <CameraIcon />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[22px] font-semibold text-text-primary">
                What fly is that?
              </h2>
              <p className="text-[14px] text-text-secondary max-w-[280px]">
                Snap a clear, well-lit photo of a single fly. We'll identify the pattern and match it to your rigs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="min-h-[48px] px-8 rounded-[12px] bg-accent-green text-header-text text-[14px] font-semibold uppercase tracking-[0.1em]"
            >
              Take Photo
            </button>
          </div>
        )}

        {previewUrl && (
          <div className="w-full aspect-square rounded-[16px] overflow-hidden bg-card-bg border border-card-border">
            <img src={previewUrl} alt="Captured fly" className="w-full h-full object-cover" />
          </div>
        )}

        {loading && (
          <div className="bg-card-bg rounded-[16px] border border-card-border p-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-text-muted">
              Identifying
            </div>
            <div className="text-[14px] text-text-secondary mt-1">Consulting the fly box…</div>
          </div>
        )}

        {error && (
          <div className="bg-card-bg rounded-[16px] border border-accent-red p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-accent-red">
              Error
            </div>
            <div className="text-[14px] text-text-primary mt-1">{error}</div>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <div className="bg-card-bg rounded-[16px] border border-card-border p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex px-3 py-1 rounded-[14px] text-[10px] uppercase tracking-[0.14em] font-semibold ${confidenceStyles(result.confidence).bg} ${confidenceStyles(result.confidence).text}`}
                >
                  {confidenceStyles(result.confidence).label}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-text-muted font-semibold">
                  {result.role}
                </span>
              </div>
              <div>
                <h2 className="font-display text-[24px] font-semibold text-text-primary leading-tight">
                  {result.name}
                </h2>
                <div className="text-[12px] text-text-muted font-medium mt-0.5">
                  {result.sizeRange}
                </div>
              </div>
              <p className="text-[14px] text-text-secondary leading-relaxed">{result.notes}</p>
            </div>

            {result.alternates.length > 0 && (
              <div className="bg-card-bg rounded-[16px] border border-card-border p-5">
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted mb-2">
                  Could also be
                </div>
                <ul className="flex flex-wrap gap-2">
                  {result.alternates.map((alt) => (
                    <li
                      key={alt}
                      className="px-3 py-1 rounded-[14px] bg-accent-cream text-text-secondary text-[12px] font-medium"
                    >
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-accent-cream rounded-[16px] p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted mb-2">
                In your rigs
              </div>
              {matches.length === 0 ? (
                <div className="text-[13px] text-text-secondary italic">
                  No current rig uses this fly.
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {matches.map((r) => (
                    <li key={r.id} className="flex flex-col">
                      <div className="text-[14px] font-semibold text-text-primary">{r.title}</div>
                      <div className="text-[12px] text-text-muted">{r.label}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={reset}
              className="w-full min-h-[48px] rounded-[12px] border border-card-border bg-card-bg text-text-primary text-[14px] font-semibold uppercase tracking-[0.1em]"
            >
              Identify Another
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </div>
  );
}
