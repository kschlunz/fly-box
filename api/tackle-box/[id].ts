import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  if (req.method === 'GET') {
    const { data: fly, error } = await supabase
      .from('tackle_box')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!fly) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const { data: photos } = await supabase
      .from('tackle_box_photos')
      .select('*')
      .eq('tackle_box_id', id)
      .order('created_at', { ascending: false });

    res.status(200).json({
      id: fly.id,
      name: fly.fly_name,
      normalizedName: fly.normalized_name,
      size: fly.size,
      role: fly.role,
      category: fly.category,
      colors: fly.colors,
      description: fly.description,
      primaryPhotoUrl: fly.photo_url,
      photoQualityScore: fly.photo_quality_score,
      count: fly.count,
      notes: fly.notes,
      firstIdentifiedAt: fly.first_identified_at,
      lastIdentifiedAt: fly.last_identified_at,
      photos: (photos ?? []).map((p: any) => ({
        id: p.id,
        photoUrl: p.photo_url,
        qualityScore: p.quality_score,
        isPrimary: p.is_primary,
        createdAt: p.created_at,
      })),
    });
    return;
  }

  if (req.method === 'DELETE') {
    const adminPass = process.env.ADMIN_PASS;
    const provided = req.headers['x-admin-pass'];
    if (!adminPass || provided !== adminPass) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: photos } = await supabase
      .from('tackle_box_photos')
      .select('photo_url')
      .eq('tackle_box_id', id);

    if (photos && photos.length > 0) {
      const paths = photos
        .map((p: any) => {
          const url = p.photo_url as string;
          const idx = url.indexOf('fly-photos/');
          return idx >= 0 ? url.substring(idx + 'fly-photos/'.length) : null;
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from('fly-photos').remove(paths);
      }
    }

    const { error } = await supabase.from('tackle_box').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
