import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type ReportSource = 'DRO' | 'Headwaters' | 'Other';

const SYSTEM_PROMPT = `You are a fly fishing report parser for the Davidson River in Brevard, NC.

You will receive a fishing report from one of these sources (specified by the user):
- Davidson River Outfitters (DRO): Tends to list specific fly patterns with sizes, focuses on Davidson River and French Broad, mentions specific spots like Coontree, Stillwater, Shut-In, and hatchery sections. Often includes other regional waters (Wilson Creek, Nantahala).
- Headwaters Outfitters: Covers Davidson, East Fork, West Fork, and nearby waters. Often more narrative and less list-focused. Mentions Avery Creek, Cove Creek, South Mills River.
- Other: Generic fishing report that may require more interpretation.

Extract structured data regardless of source format. Respond ONLY with valid JSON — no prose, no markdown code fences, no commentary. Start with { and end with }.

Output shape:
{
  "source": "DRO" | "Headwaters" | "Other",
  "conditions": {
    "water": string,                 // brief water description, e.g. "Low & gin-clear"
    "temp": string,                  // water temperature with unit, e.g. "54°F"
    "flow": string | null,           // CFS if mentioned, otherwise null (will be pulled from USGS live)
    "clarity": string,               // e.g. "Crystal Clear", "Slightly Stained", "Off-Color"
    "trend": "Rising" | "Falling" | "Stable" | null,  // null if not mentioned
    "approach": string,              // key tactical advice, one sentence
    "hatches": [
      {
        "name": string,              // e.g. "Blue Winged Olive"
        "sizes": string,             // e.g. "Size 18-22"
        "activity": 1 | 2 | 3 | 4   // 4 = very active, 3 = moderate, 2 = present, 1 = emerging
      }
    ],
    "tippet": string,                // e.g. "6X standard · Long leaders essential"
    "updated": string,               // human date from report or currentDate, e.g. "April 14, 2026"
    "source": string                 // source name as it appears in the report
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

Source-specific extraction rules:

For DRO reports:
- The "Flies:" section lists core patterns with size ranges — use these for the shopping list.
- Group by water body when multiple rivers are discussed — focus on Davidson-specific content.
- Respect mentions of specific Davidson spots (Coontree, Stillwater, Shut-In) in rig titles/tips.
- DRO tends to recommend light tippet (6X-7X) and technical presentations.

For Headwaters reports:
- Often structured around multiple waters (Davidson, East Fork, West Fork, South Mills).
- Focus extraction on Davidson River content unless report is Davidson-specific.
- Headwaters tends to mention more dry-dropper and attractor patterns.
- Watch for East Fork / West Fork French Broad spillover — filter to Davidson only.

For Other sources:
- Infer rigs even when the source only lists individual patterns.
- Default to standard Davidson River patterns if the report is generic.
- Flag lower confidence in the source field.

General rules:
- Produce 6–10 rigs covering all four sections when the report supports it.
- Each rig has 1–3 flies. For dry-dropper use roles "dry" + "dropper". For euro use "anchor" + "point". For soft-hackle use "soft". For streamer use "streamer".
- Exactly one rig (or zero) may have "hot": true — the clear standout of the week.
- "shopping" is a deduped list of every fly mentioned across all rigs, with sizes aggregated.
- Categorize shopping items: mayfly/caddis dries → "dry", bead-head or tungsten nymphs → "nymph", swung wet flies → "soft-hackle", Woolly Buggers and articulated patterns → "streamer".
- "quantity" should default to 3 unless the report emphasizes a pattern (4) or it is niche (2).
- Hatches: 3–6 entries. "activity" reflects how hot the bug is this week.
- Never invent fly patterns not mentioned in the report.
- "updated" must be a human-readable date string derived from the report date or the provided currentDate.
- If flow is not in the report, leave it as null — USGS provides live flow.
- Each fly gets a descriptor — short phrase about why it works.
- Each rig gets a description — 2–3 editorial sentences.
- If report mentions specific spots, reference them in rig title/tip.`;

const client = new Anthropic();

function detectSource(text: string): ReportSource {
  const lower = text.toLowerCase();
  if (lower.includes('davidson river outfitters') || lower.includes(' dro ') || lower.includes('dro\'s')) {
    return 'DRO';
  }
  if (lower.includes('headwaters outfitters') || lower.includes('headwaters ')) {
    return 'Headwaters';
  }
  return 'Other';
}

type ParseBody = {
  report?: string;
  currentDate?: string;
  source?: 'DRO' | 'Headwaters' | 'Other' | 'auto';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { report, currentDate, source: sourceHint } = (req.body ?? {}) as ParseBody;
  if (!report || typeof report !== 'string') {
    res.status(400).json({ error: 'Missing report text' });
    return;
  }

  const detectedSource: ReportSource =
    sourceHint && sourceHint !== 'auto' ? sourceHint : detectSource(report);

  const userContent = `Current date: ${currentDate ?? 'unknown'}
Report source: ${detectedSource}

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
