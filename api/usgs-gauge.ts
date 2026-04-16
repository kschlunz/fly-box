import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE = '03441000';
const USGS_URL = `https://waterservices.usgs.gov/nwis/iv/?sites=${SITE}&parameterCd=00060,00065&period=PT3H&format=json`;

type GaugeResponse = {
  flow: number | null;
  gaugeHeight: number | null;
  updated: string | null;
  trend: 'rising' | 'falling' | 'stable' | 'unknown';
  error?: string;
};

let cache: { data: GaugeResponse; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;

function extractSeries(
  timeSeries: unknown[],
  paramCode: string
): { latest: number | null; values: number[]; dateTime: string | null } {
  const series = timeSeries.find((s: any) => {
    const codes = s?.variable?.variableCode;
    return Array.isArray(codes) && codes.some((c: any) => c?.value === paramCode);
  }) as any;

  if (!series) return { latest: null, values: [], dateTime: null };

  const readings = series?.values?.[0]?.value;
  if (!Array.isArray(readings) || readings.length === 0) {
    return { latest: null, values: [], dateTime: null };
  }

  const values = readings
    .map((r: any) => parseFloat(r?.value))
    .filter((v: number) => !isNaN(v));

  const lastReading = readings[readings.length - 1];
  const latest = values.length > 0 ? values[values.length - 1] : null;
  const dateTime = lastReading?.dateTime ?? null;

  return { latest, values, dateTime };
}

function computeTrend(values: number[]): 'rising' | 'falling' | 'stable' | 'unknown' {
  if (values.length < 2) return 'unknown';
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return 'unknown';
  const pctChange = (last - first) / first;
  if (pctChange > 0.05) return 'rising';
  if (pctChange < -0.05) return 'falling';
  return 'stable';
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json(cache.data);
    return;
  }

  try {
    const response = await fetch(USGS_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`USGS returned ${response.status}`);
    }

    const json = (await response.json()) as { value?: { timeSeries?: unknown[] } };
    const timeSeries = json?.value?.timeSeries;
    if (!Array.isArray(timeSeries)) {
      throw new Error('Unexpected USGS response shape');
    }

    const discharge = extractSeries(timeSeries, '00060');
    const gauge = extractSeries(timeSeries, '00065');
    const trend = computeTrend(discharge.values);

    const data: GaugeResponse = {
      flow: discharge.latest !== null ? Math.round(discharge.latest) : null,
      gaugeHeight: gauge.latest !== null ? Math.round(gauge.latest * 100) / 100 : null,
      updated: discharge.dateTime ?? gauge.dateTime,
      trend,
    };

    cache = { data, ts: Date.now() };
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json(data);
  } catch (err) {
    const fallback: GaugeResponse = {
      flow: null,
      gaugeHeight: null,
      updated: null,
      trend: 'unknown',
      error: 'USGS data unavailable',
    };
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json(fallback);
  }
}
