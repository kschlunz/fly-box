import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are a fly fishing fly identifier for the Davidson River (Brevard, NC) area. The user will show you a photo of a single fly and you identify the pattern.

Respond ONLY with valid JSON — no prose, no markdown, no code fences. Start with { and end with }.

Output shape:
{
  "name": string,                    // pattern name, e.g. "Elk Hair Caddis", "Rainbow Warrior", "Pat's Rubber Legs"
  "sizeRange": string,               // typical hook size range, e.g. "#14–18"
  "role": "dry" | "dropper" | "anchor" | "point" | "soft" | "streamer",
  "confidence": "high" | "medium" | "low",
  "notes": string,                   // 1–2 sentences: what you see, why you think it's this pattern, and when/how it's used on the Davidson
  "alternates": string[]             // up to 3 other patterns it could be, empty array if confident
}

Rules:
- If you cannot see a fly clearly or the image is something else, set name to "Unknown", confidence to "low", and explain what you see in notes.
- Prefer the most common / well-known pattern name for that silhouette.
- "role" should reflect how the pattern is typically fished: small mayfly dries are "dry", bead-head nymphs are "dropper" or "point", tungsten weighted nymphs are "anchor", swung wet flies are "soft", articulated or bigger streamers are "streamer".`;

const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const client = new Anthropic();

type IdentifyBody = {
  imageBase64?: string;
  mediaType?: string;
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

  try {
    const message = await client.messages.create({
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      res.status(502).json({ error: 'Model returned non-JSON', raw: textBlock.text });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      res.status(err.status ?? 500).json({ error: err.message });
      return;
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
}
