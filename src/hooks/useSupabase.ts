import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import {
  defaultConditions,
  defaultGear,
  defaultRigs,
  defaultShoppingList,
} from '../data/defaults';
import type {
  Conditions,
  Fly,
  GearItem,
  Hatch,
  Rig,
  Section,
  ShoppingCategory,
  ShoppingItem,
} from '../data/types';

type RigRow = {
  id: string;
  section: Section;
  label: string;
  title: string;
  when: string;
  tip: string;
  description: string | null;
  flies: Fly[];
  hot: boolean | null;
  photo_url: string | null;
  sort_order: number;
};

type ConditionsRow = {
  id: number;
  water: string;
  temp: string;
  flow: string | null;
  clarity: string | null;
  trend: string | null;
  approach: string;
  hatches: Hatch[];
  tippet: string;
  updated: string;
  source: string;
};

type ShoppingRow = {
  id: number;
  name: string;
  sizes: string;
  category: ShoppingCategory;
  descriptor: string | null;
  quantity: number | null;
  sort_order: number;
};

type GearRow = {
  id: number;
  name: string;
  sort_order: number;
};

type SupabaseData = {
  conditions: Conditions;
  rigs: Rig[];
  shoppingList: ShoppingItem[];
  gear: GearItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function rowToRig(row: RigRow): Rig {
  return {
    id: row.id,
    section: row.section,
    label: row.label,
    title: row.title,
    when: row.when,
    tip: row.tip,
    flies: row.flies,
    description: row.description ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    hot: row.hot ?? undefined,
  };
}

export function useSupabase(): SupabaseData {
  const [conditions, setConditions] = useState<Conditions>(defaultConditions);
  const [rigs, setRigs] = useState<Rig[]>(defaultRigs);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(defaultShoppingList);
  const [gear, setGear] = useState<GearItem[]>(defaultGear);
  const [loading, setLoading] = useState<boolean>(supabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [cRes, rRes, sRes, gRes] = await Promise.all([
        supabase.from('conditions').select('*').eq('id', 1).maybeSingle(),
        supabase.from('rigs').select('*').order('sort_order', { ascending: true }),
        supabase.from('shopping').select('*').order('sort_order', { ascending: true }),
        supabase.from('gear_defaults').select('*').order('sort_order', { ascending: true }),
      ]);

      if (cRes.error) throw cRes.error;
      if (rRes.error) throw rRes.error;
      if (sRes.error) throw sRes.error;
      if (gRes.error) throw gRes.error;

      if (cRes.data) {
        const row = cRes.data as ConditionsRow;
        setConditions({
          water: row.water,
          temp: row.temp,
          flow: row.flow ?? undefined,
          clarity: row.clarity ?? undefined,
          trend: row.trend ?? undefined,
          approach: row.approach,
          hatches: row.hatches ?? [],
          tippet: row.tippet,
          updated: row.updated,
          source: row.source,
        });
      }

      if (rRes.data && rRes.data.length > 0) {
        setRigs((rRes.data as RigRow[]).map(rowToRig));
      }

      if (sRes.data && sRes.data.length > 0) {
        setShoppingList(
          (sRes.data as ShoppingRow[]).map((r) => ({
            name: r.name,
            sizes: r.sizes,
            category: r.category,
            descriptor: r.descriptor ?? undefined,
            quantity: r.quantity ?? undefined,
          })),
        );
      }

      if (gRes.data && gRes.data.length > 0) {
        setGear((gRes.data as GearRow[]).map((r) => ({ name: r.name })));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { conditions, rigs, shoppingList, gear, loading, error, refetch: load };
}
