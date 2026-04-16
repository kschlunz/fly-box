import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Fly = { name: string; size: string; role: string; descriptor?: string };

type Rig = {
  id: string;
  section: string;
  label: string;
  title: string;
  when: string;
  flies: Fly[];
  tip: string;
  description?: string;
  photoUrl?: string;
  hot?: boolean;
};

type Hatch = { name: string; sizes: string; activity: number };

type Conditions = {
  water: string;
  temp: string;
  flow?: string;
  clarity?: string;
  trend?: string;
  approach: string;
  hatches: Hatch[];
  tippet: string;
  updated: string;
  source: string;
};

type ShoppingItem = {
  name: string;
  sizes: string;
  category: string;
  descriptor?: string;
  quantity?: number;
};

type PublishBody = {
  conditions: Conditions;
  rigs: Rig[];
  shopping: ShoppingItem[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPass = process.env.ADMIN_PASS;
  const provided = req.headers['x-admin-pass'];
  if (!adminPass) {
    res.status(401).json({ error: 'ADMIN_PASS env var not set on server' });
    return;
  }
  if (!provided) {
    res.status(401).json({ error: 'x-admin-pass header missing from request' });
    return;
  }
  if (provided !== adminPass) {
    res.status(401).json({ error: 'Passphrase mismatch' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const body = (req.body ?? {}) as PublishBody;
  if (!body.conditions || !Array.isArray(body.rigs) || !Array.isArray(body.shopping)) {
    res.status(400).json({ error: 'Invalid payload shape' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    const { error: delRigsErr } = await supabase.from('rigs').delete().neq('id', '');
    if (delRigsErr) throw delRigsErr;

    const { error: delShopErr } = await supabase.from('shopping').delete().neq('id', 0);
    if (delShopErr) throw delShopErr;

    const rigRows = body.rigs.map((r, i) => ({
      id: r.id || String(i + 1),
      section: r.section,
      label: r.label,
      title: r.title,
      when: r.when,
      flies: r.flies,
      tip: r.tip,
      description: r.description ?? null,
      photo_url: r.photoUrl ?? null,
      hot: r.hot ?? false,
      sort_order: i,
    }));

    if (rigRows.length > 0) {
      const { error: insRigsErr } = await supabase.from('rigs').insert(rigRows);
      if (insRigsErr) throw insRigsErr;
    }

    const shopRows = body.shopping.map((s, i) => ({
      name: s.name,
      sizes: s.sizes,
      category: s.category,
      descriptor: s.descriptor ?? null,
      quantity: s.quantity ?? 3,
      sort_order: i,
    }));

    if (shopRows.length > 0) {
      const { error: insShopErr } = await supabase.from('shopping').insert(shopRows);
      if (insShopErr) throw insShopErr;
    }

    const { error: condErr } = await supabase.from('conditions').upsert({
      id: 1,
      water: body.conditions.water,
      temp: body.conditions.temp,
      flow: body.conditions.flow ?? null,
      clarity: body.conditions.clarity ?? null,
      trend: body.conditions.trend ?? null,
      approach: body.conditions.approach,
      hatches: body.conditions.hatches,
      tippet: body.conditions.tippet,
      updated: body.conditions.updated,
      source: body.conditions.source,
    });
    if (condErr) throw condErr;

    res.status(200).json({ ok: true, counts: { rigs: rigRows.length, shopping: shopRows.length } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Publish failed';
    res.status(500).json({ error: msg });
  }
}
