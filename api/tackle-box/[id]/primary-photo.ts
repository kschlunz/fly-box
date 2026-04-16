import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const { photoId } = (req.body ?? {}) as { photoId?: string };
  if (typeof id !== 'string' || !photoId) {
    res.status(400).json({ error: 'Missing id or photoId' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: photo, error: photoErr } = await supabase
    .from('tackle_box_photos')
    .select('photo_url, quality_score')
    .eq('id', photoId)
    .eq('tackle_box_id', id)
    .maybeSingle();

  if (photoErr || !photo) {
    res.status(404).json({ error: 'Photo not found' });
    return;
  }

  await supabase
    .from('tackle_box_photos')
    .update({ is_primary: false })
    .eq('tackle_box_id', id);

  await supabase
    .from('tackle_box_photos')
    .update({ is_primary: true })
    .eq('id', photoId);

  await supabase
    .from('tackle_box')
    .update({
      photo_url: photo.photo_url,
      photo_quality_score: photo.quality_score,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  res.status(200).json({ ok: true });
}
