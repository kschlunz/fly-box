import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You parse Davidson River (Brevard, NC) fly fishing reports into structured JSON for a personal Field Journal app.

Respond ONLY with valid JSON — no prose, no markdown code fences, no commentary. Start with { and end with }.

Output shape:
{
  "conditions": {
    "water": string,                 // short water description, e.g. "Low & gin-clear"
    "temp": string,                  // e.g. "54°F"
    "flow": string,                  // flow rate, e.g. "124 cfs"
    "clarity": string,               // e.g. "Crystal Clear" or "Slightly Stained"
    "trend": string,                 // one of "Rising", "Falling", "Steady"
    "approach": string,              // short strategic summary, one sentence
    "hatches": [
      {
        "name": string,              // e.g. "Blue Winged Olive"
        "sizes": string,             // e.g. "Size 18-22"
        "activity": 1 | 2 | 3 | 4    // 4 = very active, 3 = moderate, 2 = present, 1 = emerging
      }
    ],
    "tippet": string,                // e.g. "6X standard · Long leaders essential"
    "updated": string,               // human date from report or currentDate, e.g. "April 14, 2026"
    "source": string                 // shop or author name
  },
  "rigs": [
    {
      "id": string,                  // sequential "1", "2", "3", ...
      "section": "dry-dropper" | "euro" | "soft-hackle" | "streamer",
      "label": string,               // short category tag, e.g. "Dry-dropper · #1 rig this week"
      "title": string,               // short rig name, e.g. "Caddis + nymph"
      "when": string,                // when to fish it, e.g. "All day" or "2–5 PM warm days"
      "description": string,         // 1–2 sentences on why this rig is working this week
      "flies": [
        {
          "name": string,            // fly pattern name
          "size": string,            // e.g. "#14–16"
          "role": "dry" | "dropper" | "anchor" | "point" | "soft" | "streamer",
          "descriptor": string       // one short phrase, e.g. "Buoyant and highly visible attractor"
        }
      ],
      "tip": string,                 // 1–2 sentence tactical tip
      "hot": boolean                 // true ONLY for the single #1 rig this week
    }
  ],
  "shopping": [
    {
      "name": string,                // fly pattern name
      "sizes": string,               // e.g. "#14, #16"
      "category": "dry" | "nymph" | "streamer" | "soft-hackle" | "other",
      "descriptor": string,          // one short phrase explaining why it is on the list
      "quantity": number             // how many to pick up, 2–4
    }
  ]
}

Rules:
- Produce 6–10 rigs covering all four sections when the report supports it.
- Each rig has 1–3 flies. For dry-dropper use roles "dry" + "dropper". For euro use "anchor" + "point". For soft-hackle use "soft". For streamer use "streamer".
- Exactly one rig (or zero) may have "hot": true — the clear standout of the week.
- "shopping" is a deduped list of every fly mentioned across all rigs, with sizes aggregated (e.g. "#14, #16, #18").
- Categorize shopping items: mayfly/caddis dries → "dry", bead-head or tungsten nymphs → "nymph", swung wet flies → "soft-hackle", Woolly Buggers and articulated patterns → "streamer".
- "quantity" should default to 3 unless the report emphasizes a pattern (4) or it is niche (2).
- Hatches: 3–6 entries. "activity" reflects how hot the bug is this week.
- Never invent fly patterns not mentioned in the report.
- "updated" must be a human-readable date string derived from the report date or the provided currentDate.`;

const client = new Anthropic();

type ParseBody = {
  report?: string;
  currentDate?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { report, currentDate } = (req.body ?? {}) as ParseBody;
  if (!report || typeof report !== 'string') {
    res.status(400).json({ error: 'Missing report text' });
    return;
  }

  const userContent = `Current date: ${currentDate ?? 'unknown'}

Fishing report:
${report}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
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
