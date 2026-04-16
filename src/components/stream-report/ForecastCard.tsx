import { useEffect, useState } from 'react';
import type { Forecast } from '../../data/types';

const FALLBACK: Forecast = {
  current: 62,
  condition: 'Sunny',
  high: 68,
  low: 44,
  hourly: [
    { time: '8AM', temp: 48 },
    { time: '12PM', temp: 61 },
    { time: '4PM', temp: 66 },
    { time: '8PM', temp: 54 },
  ],
};

function tempColor(t: number, min: number, max: number): string {
  if (max === min) return '#7fa898';
  const pct = (t - min) / (max - min);
  if (pct > 0.66) return '#c8a020';
  if (pct > 0.33) return '#7fa898';
  return '#8aab98';
}

export function ForecastCard() {
  const [data, setData] = useState<Forecast>(FALLBACK);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/weather')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('weather failed'))))
      .then((d) => {
        if (!cancelled && d && typeof d.current === 'number') {
          setData(d as Forecast);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const temps = data.hourly.map((h) => h.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);

  return (
    <div id="forecast-card" className="mx-4 bg-card-bg rounded-[16px] border border-card-border p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted">
          Forecast {failed && <span className="normal-case text-accent-red"> · offline</span>}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="text-[56px] leading-none font-semibold text-text-primary font-sans">
          {data.current}°
        </div>
        <div className="pb-2 flex flex-col">
          <div className="text-[16px] font-medium text-text-primary">{data.condition}</div>
          <div className="text-[12px] text-text-muted">
            H: {data.high}° L: {data.low}°
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2">
        {data.hourly.map((h) => (
          <div key={h.time} className="flex flex-col items-center gap-1">
            <div className="text-[11px] text-text-muted uppercase tracking-wide">{h.time}</div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tempColor(h.temp, minT, maxT) }}
              aria-hidden
            />
            <div className="text-[15px] font-semibold text-text-primary">{h.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
