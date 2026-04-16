import type {
  Conditions,
  GearItem,
  Rig,
  Section,
  ShoppingItem,
} from './types';

export const defaultConditions: Conditions = {
  water: 'Low & gin-clear',
  temp: '54°F',
  flow: '124 cfs',
  clarity: 'Crystal Clear',
  trend: 'Falling',
  approach: 'Fish early AM & late evening',
  hatches: [
    { name: 'Blue Winged Olive', sizes: 'Size 18-22', activity: 4 },
    { name: 'Caddis', sizes: 'Size 14-16', activity: 3 },
    { name: 'Hendrickson', sizes: 'Size 14', activity: 2 },
    { name: 'Yellow Sally', sizes: 'Size 14-16', activity: 2 },
  ],
  tippet: '6X standard · Long leaders essential',
  updated: 'April 14, 2026',
  source: 'Davidson River Outfitters',
};

export const sectionMeta: Record<
  Section,
  { name: string; connector: string; accent: string }
> = {
  'dry-dropper': { name: 'Dry-dropper', connector: '↓', accent: '#2c5a42' },
  euro: { name: 'Euro nymph', connector: '→', accent: '#4a5a2c' },
  'soft-hackle': { name: 'Soft hackle', connector: '+', accent: '#5a3590' },
  streamer: { name: 'Streamer', connector: '', accent: '#8e3a14' },
};

export const defaultRigs: Rig[] = [
  {
    id: '1',
    section: 'dry-dropper',
    label: 'Dry-dropper · #1 rig this week',
    title: 'Caddis + nymph',
    when: 'All day',
    hot: true,
    description:
      'The standout of the week. Caddis are the primary surface bug and the Rainbow Warrior is producing subsurface on Davidson regulars.',
    flies: [
      {
        name: 'Elk Hair Caddis',
        size: '#14–16',
        role: 'dry',
        descriptor: 'Buoyant and highly visible attractor',
      },
      {
        name: 'Rainbow Warrior',
        size: '#16–18',
        role: 'dropper',
        descriptor: 'Flashy attractor dropped 18" below the dry',
      },
    ],
    tip: '6X tippet, long leader. Lead with the caddis to raise the first fish you see.',
  },
  {
    id: '2',
    section: 'dry-dropper',
    label: 'Dry-dropper · hatch window',
    title: 'Hendrickson afternoon',
    when: '2–5 PM warm days',
    description:
      'Hendricksons just starting mid-April. Pair the dun with a PT emerger trailing short.',
    flies: [
      {
        name: 'Hendrickson',
        size: '#14',
        role: 'dry',
        descriptor: 'Match the hatch during warm afternoon windows',
      },
      {
        name: 'Pheasant Tail',
        size: '#16',
        role: 'dropper',
        descriptor: 'Classic emerger profile trailing 12" below',
      },
    ],
    tip: 'Cast upstream of rising fish, mend once, let it drift into the lane.',
  },
  {
    id: '3',
    section: 'dry-dropper',
    label: 'Dry-dropper · fallback',
    title: 'Adams + midge',
    when: 'Anytime',
    description:
      'Classic fallback for when you cannot read the water. Adams stays visible, midge covers the year-round midge diet.',
    flies: [
      {
        name: 'Parachute Adams',
        size: '#16–18',
        role: 'dry',
        descriptor: 'Visible and buoyant search pattern',
      },
      {
        name: 'Zebra Midge',
        size: '#20–22',
        role: 'dropper',
        descriptor: 'Covers the ever-present midge feed',
      },
    ],
    tip: 'When in doubt, tie this on. It searches water well and catches skittish Davidson fish.',
  },
  {
    id: '4',
    section: 'dry-dropper',
    label: 'Dry-dropper · stonefly window',
    title: 'Yellow Sally activity',
    when: 'Warm afternoons',
    description:
      'Yellow Sallies are showing. Drop a Copper John below to cover the stonefly nymph subsurface.',
    flies: [
      {
        name: 'Yellow Sally',
        size: '#14–16',
        role: 'dry',
        descriptor: 'Small yellow stonefly dry for warm afternoons',
      },
      {
        name: 'Copper John',
        size: '#16',
        role: 'dropper',
        descriptor: 'Imitates stonefly and mayfly nymphs',
      },
    ],
    tip: 'Look for fish slashing on top near riffles — that is Yellow Sally activity.',
  },
  {
    id: '5',
    section: 'euro',
    label: 'Euro · deep pools',
    title: 'Tungsten deep rig',
    when: 'Early AM / deep pools',
    description:
      'Tungsten Death Metal is on the shop hot list. Heavy anchor gets down fast in the deepest pools.',
    flies: [
      {
        name: 'Tungsten Death Metal',
        size: '#16–18',
        role: 'anchor',
        descriptor: 'Heavy tungsten anchor that digs deep',
      },
      {
        name: 'RS2 Midge',
        size: '#20–22',
        role: 'point',
        descriptor: 'Trailing midge emerger on 6X',
      },
    ],
    tip: 'Lead the rig through the seam, keep your sighter tight, expect subtle takes.',
  },
  {
    id: '6',
    section: 'euro',
    label: 'Euro · midday',
    title: 'Attractor + midge',
    when: 'Midday',
    description:
      'Rainbow Warrior is the standout right now. Pair it with a small midge to cover both triggers.',
    flies: [
      {
        name: 'Rainbow Warrior',
        size: '#16',
        role: 'anchor',
        descriptor: 'Flashy attractor nymph in the top slot',
      },
      {
        name: 'Zebra Midge',
        size: '#20–22',
        role: 'point',
        descriptor: 'Micro-midge chaser',
      },
    ],
    tip: 'Tight-line through any moderate-depth run. The flash triggers committed grabs.',
  },
  {
    id: '7',
    section: 'euro',
    label: 'Euro · upstream runs',
    title: "Pat's stone + PT",
    when: 'Anytime',
    description:
      'Big stonefly anchor for deeper upstream sections like Coontree and Shut-In. PT trails for a natural look.',
    flies: [
      {
        name: "Pat's Rubber Legs",
        size: '#10',
        role: 'anchor',
        descriptor: 'Big stonefly silhouette that sinks the rig',
      },
      {
        name: 'Pheasant Tail',
        size: '#18',
        role: 'point',
        descriptor: 'Natural mayfly nymph 20" below',
      },
    ],
    tip: 'Works best in pocket water where the anchor gets to bottom fast.',
  },
  {
    id: '8',
    section: 'soft-hackle',
    label: 'Soft hackle · swing',
    title: 'Swing through tailouts',
    when: 'Evening',
    description:
      'Fish are eating soft hackles dead drift AND on the swing. Try both on the same run.',
    flies: [
      {
        name: 'Partridge & Orange',
        size: '#14–16',
        role: 'soft',
        descriptor: 'Classic North Country wet',
      },
      {
        name: 'PT Soft Hackle',
        size: '#16',
        role: 'soft',
        descriptor: 'Mayfly emerger profile on the swing',
      },
    ],
    tip: 'Cast across, let the flies swing through the tailout, feel for the tap.',
  },
  {
    id: '9',
    section: 'streamer',
    label: 'Streamer · low-light',
    title: 'Deep pools, banks',
    when: 'Dawn & dusk only',
    description:
      'Low clear water means early and late only. Slow strips, let it sink, work banks and deep pools.',
    flies: [
      {
        name: 'Woolly Bugger (olive)',
        size: '#8–10',
        role: 'streamer',
        descriptor: 'Olive Woolly Bugger, slow strip retrieve',
      },
    ],
    tip: '4X–5X tippet. Pause between strips — big fish eat on the drop.',
  },
];

export const defaultShoppingList: ShoppingItem[] = [
  {
    name: 'Parachute Adams',
    sizes: '#16, #18, #20',
    category: 'dry',
    descriptor: 'Essential for morning rises and search drifts',
    quantity: 3,
  },
  {
    name: 'Elk Hair Caddis',
    sizes: '#14, #16',
    category: 'dry',
    descriptor: 'Primary surface bug on the Davidson right now',
    quantity: 3,
  },
  {
    name: 'Hendrickson',
    sizes: '#14, #16',
    category: 'dry',
    descriptor: 'Match the hatch on warm April afternoons',
    quantity: 2,
  },
  {
    name: 'Yellow Sally',
    sizes: '#14, #16',
    category: 'dry',
    descriptor: 'Stonefly dry for warm-afternoon slashes',
    quantity: 2,
  },
  {
    name: 'Rainbow Warrior',
    sizes: '#16, #18, #20',
    category: 'nymph',
    descriptor: 'Shop standout — keep a handful on hand',
    quantity: 4,
  },
  {
    name: 'Tungsten Death Metal',
    sizes: '#16, #18, #20',
    category: 'nymph',
    descriptor: 'Heavy tungsten anchor for deep pools',
    quantity: 3,
  },
  {
    name: 'Pheasant Tail',
    sizes: '#16, #18',
    category: 'nymph',
    descriptor: 'Classic mayfly nymph and emerger profile',
    quantity: 3,
  },
  {
    name: 'RS2 Midge',
    sizes: '#18, #20, #22',
    category: 'nymph',
    descriptor: 'Subsurface midge emerger on 6X',
    quantity: 3,
  },
  {
    name: 'Zebra Midge',
    sizes: '#18, #20, #22',
    category: 'nymph',
    descriptor: 'Covers the year-round midge diet',
    quantity: 3,
  },
  {
    name: 'Copper John',
    sizes: '#14, #16',
    category: 'nymph',
    descriptor: 'Works as stone or mayfly nymph dropper',
    quantity: 2,
  },
  {
    name: "Pat's Rubber Legs",
    sizes: '#8, #10',
    category: 'nymph',
    descriptor: 'Big stonefly anchor for upstream pocket water',
    quantity: 2,
  },
  {
    name: 'Partridge & Orange',
    sizes: '#14, #16',
    category: 'soft-hackle',
    descriptor: 'Swung through tailouts at evening',
    quantity: 2,
  },
  {
    name: 'PT Soft Hackle',
    sizes: '#14, #16',
    category: 'soft-hackle',
    descriptor: 'Mayfly emerger profile for the swing',
    quantity: 2,
  },
  {
    name: 'Woolly Bugger (olive)',
    sizes: '#8, #10',
    category: 'streamer',
    descriptor: 'Dawn and dusk only, slow strip',
    quantity: 2,
  },
];

export const defaultGear: GearItem[] = [
  { name: 'Floating Fly Line (5wt)' },
  { name: '9ft Tapered Leaders (4x)' },
  { name: '6X Fluorocarbon Tippet' },
  { name: 'Hemostats' },
  { name: 'Nippers' },
  { name: 'Floatant' },
  { name: 'Split Shot (assorted)' },
];

export const categoryLabels: Record<ShoppingItem['category'], string> = {
  dry: 'Dry Flies',
  nymph: 'Nymphs & Sub-surface',
  streamer: 'Streamers',
  'soft-hackle': 'Soft Hackles',
  other: 'Other',
};

export const categoryOrder: ShoppingItem['category'][] = [
  'dry',
  'nymph',
  'soft-hackle',
  'streamer',
  'other',
];
