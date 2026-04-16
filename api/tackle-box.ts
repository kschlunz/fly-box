import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const supabase = createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });

  const { category, role } = req.query;

  let query = supabase
    .from('tackle_box')
    .select('*')
    .order('last_identified_at', { ascending: false });

  if (typeof category === 'string' && category) {
    query = query.eq('category', category);
  }
  if (typeof role === 'string' && role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const { count: photoCountResult } = await supabase
    .from('tackle_box_photos')
    .select('tackle_box_id', { count: 'exact', head: true });

  const photoCounts = new Map<string, number>();
  if (data && data.length > 0) {
    const { data: pcData } = await supabase
      .from('tackle_box_photos')
      .select('tackle_box_id');
    if (pcData) {
      for (const row of pcData) {
        const id = row.tackle_box_id as string;
        photoCounts.set(id, (photoCounts.get(id) ?? 0) + 1);
      }
    }
  }

  const flies = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.fly_name,
    normalizedName: row.normalized_name,
    size: row.size,
    role: row.role,
    category: row.category,
    colors: row.colors,
    description: row.description,
    primaryPhotoUrl: row.photo_url,
    photoQualityScore: row.photo_quality_score,
    count: row.count,
    photoCount: photoCounts.get(row.id) ?? 1,
    notes: row.notes,
    firstIdentifiedAt: row.first_identified_at,
    lastIdentifiedAt: row.last_identified_at,
  }));

  void photoCountResult;

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.status(200).json({ total: flies.length, flies });
}
