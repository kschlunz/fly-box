import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are a fly fishing fly identifier for the Davidson River (Brevard, NC) area. The user will show you a photo of a single fly and you identify the pattern.

Respond ONLY with valid JSON — no prose, no markdown, no code fences. Start with { and end with }.

Output shape:
{
  "name": string,
  "sizeRange": string,
  "role": "dry" | "dropper" | "anchor" | "point" | "soft" | "streamer",
  "confidence": "high" | "medium" | "low",
  "notes": string,
  "alternates": string[],
  "category": string,
  "colors": string,
  "photoQuality": number
}

Fields:
- name: pattern name, e.g. "Elk Hair Caddis", "Rainbow Warrior"
- sizeRange: typical hook size range, e.g. "#14–18"
- role: how the pattern is typically fished
- confidence: how sure you are
- notes: 1–2 sentences about what you see and when/how it's used on the Davidson
- alternates: up to 3 other patterns it could be, empty array if confident
- category: broad category — one of "mayfly", "caddis", "stonefly", "midge", "terrestrial", "streamer", "attractor", "other"
- colors: brief description of the fly's coloring, e.g. "elk hair wing, olive dubbed body, brown hackle"
- photoQuality: 0-100 based on: focus/sharpness (0-30), lighting/color accuracy (0-25), background cleanliness (0-20), fly fills frame (0-15), clarity of tying details (0-10)

Rules:
- If you cannot see a fly clearly, set name to "Unknown", confidence to "low", photoQuality to 0.
- Prefer the most common pattern name for that silhouette.`;

const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const ALIASES: Record<string, string> = {
  'pt-nymph': 'pheasant-tail',
  'pheasant-tail-nymph': 'pheasant-tail',
  'phesant-tail': 'pheasant-tail',
  'hares-ear': 'hares-ear',
  'hares-ear-nymph': 'hares-ear',
  'bwo': 'blue-winged-olive',
  'bwo-parachute': 'blue-winged-olive-parachute',
  'ehc': 'elk-hair-caddis',
  'rainbow-warrior-nymph': 'rainbow-warrior',
};

function normalizeFlyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-');
  return ALIASES[slug] || slug;
}

const anthropic = new Anthropic();

type IdentifyBody = { imageBase64?: string; mediaType?: string };

type IdResult = {
  name: string;
  sizeRange: string;
  role: string;
  confidence: string;
  notes: string;
  alternates: string[];
  category: string;
  colors: string;
  photoQuality: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { imageBase64, mediaType } = (req.body ?? {}) as IdentifyBody;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    res.status(400).json({ error: 'Missing imageBase64' });
    return;
  }
  if (!mediaType || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
    res.status(400).json({ error: 'Invalid mediaType' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasSupabase = !!(supabaseUrl && serviceKey);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: imageBase64,
              },
            },
            { type: 'text', text: 'Identify this fly.' },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      res.status(502).json({ error: 'Empty response from model' });
      return;
    }

    let identification: IdResult;
    try {
      identification = JSON.parse(textBlock.text) as IdResult;
    } catch {
      res.status(502).json({ error: 'Model returned non-JSON', raw: textBlock.text });
      return;
    }

    if (!hasSupabase) {
      res.status(200).json({
        identification,
        tackleBox: null,
        shoppingMatch: { matched: false, itemKey: null },
      });
      return;
    }

    const supabase = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false },
    });

    const normalizedName = normalizeFlyName(identification.name);
    const photoQuality = identification.photoQuality ?? 50;

    const { data: existing } = await supabase
      .from('tackle_box')
      .select('id, photo_quality_score, count')
      .eq('normalized_name', normalizedName)
      .maybeSingle();

    const photoId = crypto.randomUUID();
    const tackleBoxId = existing?.id ?? crypto.randomUUID();
    const storagePath = `${tackleBoxId}/${photoId}.jpg`;

    const photoBuffer = Buffer.from(imageBase64, 'base64');
    const { error: uploadErr } = await supabase.storage
      .from('fly-photos')
      .upload(storagePath, photoBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadErr) {
      res.status(502).json({ error: `Photo upload failed: ${uploadErr.message}` });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('fly-photos')
      .getPublicUrl(storagePath);
    const publicPhotoUrl = urlData.publicUrl;

    let isNewEntry: boolean;
    let photoUpdated = false;
    let previousQuality: number | null = null;
    let count = 1;

    if (existing) {
      isNewEntry = false;
      previousQuality = existing.photo_quality_score;
      count = (existing.count ?? 1) + 1;
      photoUpdated = photoQuality > (existing.photo_quality_score ?? 0);

      const updateFields: Record<string, unknown> = {
        count,
        last_identified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (photoUpdated) {
        updateFields.photo_url = publicPhotoUrl;
        updateFields.photo_quality_score = photoQuality;
      }

      await supabase.from('tackle_box').update(updateFields).eq('id', existing.id);

      await supabase.from('tackle_box_photos').insert({
        id: photoId,
        tackle_box_id: existing.id,
        photo_url: publicPhotoUrl,
        quality_score: photoQuality,
        identification_result: identification,
        is_primary: photoUpdated,
      });

      if (photoUpdated) {
        await supabase
          .from('tackle_box_photos')
          .update({ is_primary: false })
          .eq('tackle_box_id', existing.id)
          .neq('id', photoId);
      }
    } else {
      isNewEntry = true;

      await supabase.from('tackle_box').insert({
        id: tackleBoxId,
        fly_name: identification.name,
        normalized_name: normalizedName,
        size: identification.sizeRange ?? null,
        role: identification.role,
        category: identification.category ?? 'other',
        colors: identification.colors ?? null,
        description: identification.notes ?? null,
        photo_url: publicPhotoUrl,
        photo_quality_score: photoQuality,
        count: 1,
      });

      await supabase.from('tackle_box_photos').insert({
        id: photoId,
        tackle_box_id: tackleBoxId,
        photo_url: publicPhotoUrl,
        quality_score: photoQuality,
        identification_result: identification,
        is_primary: true,
      });
    }

    const { data: shopItems } = await supabase
      .from('shopping')
      .select('name, sizes')
      .order('sort_order');

    let matchedKey: string | null = null;
    if (shopItems) {
      for (const item of shopItems) {
        const itemNorm = normalizeFlyName(item.name);
        if (itemNorm === normalizedName || itemNorm.includes(normalizedName) || normalizedName.includes(itemNorm)) {
          matchedKey = `${item.name}__${item.sizes}`;
          break;
        }
      }
    }

    res.status(200).json({
      identification,
      tackleBox: {
        id: tackleBoxId,
        isNewEntry,
        count,
        photoUpdated,
        previousPhotoQuality: previousQuality,
      },
      shoppingMatch: {
        matched: !!matchedKey,
        itemKey: matchedKey,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      res.status(err.status ?? 500).json({ error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
}
