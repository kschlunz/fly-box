import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=35.2334&longitude=-82.7343' +
  '&hourly=temperature_2m,weathercode' +
  '&daily=temperature_2m_max,temperature_2m_min' +
  '&current_weather=true&temperature_unit=fahrenheit' +
  '&timezone=America/New_York&forecast_days=1';

const PICK_HOURS = [8, 12, 16, 20];

function describeWmo(code: number): string {
  if (code === 0) return 'Sunny';
  if (code === 1) return 'Mostly Sunny';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code === 95) return 'Thunderstorms';
  if (code >= 96) return 'Stormy';
  return 'Fair';
}

function formatHour(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h12}${ampm}`;
}

type OpenMeteoResponse = {
  current_weather?: { temperature: number; weathercode: number };
  daily?: { temperature_2m_max: number[]; temperature_2m_min: number[] };
  hourly?: { time: string[]; temperature_2m: number[] };
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const upstream = await fetch(OPEN_METEO_URL);
    if (!upstream.ok) {
      res.status(502).json({ error: `Weather upstream ${upstream.status}` });
      return;
    }
    const data = (await upstream.json()) as OpenMeteoResponse;

    const current = Math.round(data.current_weather?.temperature ?? 0);
    const code = data.current_weather?.weathercode ?? 0;
    const condition = describeWmo(code);
    const high = Math.round(data.daily?.temperature_2m_max?.[0] ?? 0);
    const low = Math.round(data.daily?.temperature_2m_min?.[0] ?? 0);

    const hourly: Array<{ time: string; temp: number }> = [];
    const times = data.hourly?.time ?? [];
    const temps = data.hourly?.temperature_2m ?? [];
    for (let i = 0; i < times.length; i++) {
      const iso = times[i];
      const hour = parseInt(iso.slice(11, 13), 10);
      if (PICK_HOURS.includes(hour)) {
        hourly.push({ time: formatHour(hour), temp: Math.round(temps[i]) });
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.status(200).json({ current, condition, high, low, hourly });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Weather fetch failed';
    res.status(500).json({ error: msg });
  }
}
