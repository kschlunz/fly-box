import { useCallback, useEffect, useState } from 'react';
import type { TackleBoxFly } from '../data/types';

type UseTackleBoxResult = {
  flies: TackleBoxFly[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useTackleBox(): UseTackleBoxResult {
  const [flies, setFlies] = useState<TackleBoxFly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tackle-box');
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setFlies(data.flies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tackle box');
      setFlies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { flies, loading, error, refresh: load };
}
