import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const { notes } = (req.body ?? {}) as { notes?: string };
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { error } = await supabase
    .from('tackle_box')
    .update({
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
}
