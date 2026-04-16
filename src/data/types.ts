export type FlyRole = 'dry' | 'dropper' | 'anchor' | 'point' | 'soft' | 'streamer';

export type Fly = {
  name: string;
  size: string;
  role: FlyRole;
  descriptor?: string;
};

export type Section = 'dry-dropper' | 'euro' | 'soft-hackle' | 'streamer';

export type Rig = {
  id: string;
  section: Section;
  label: string;
  title: string;
  when: string;
  flies: Fly[];
  tip: string;
  description?: string;
  photoUrl?: string;
  hot?: boolean;
};

export type HatchActivity = 1 | 2 | 3 | 4;

export type Hatch = {
  name: string;
  sizes: string;
  activity: HatchActivity;
};

export type Conditions = {
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

export type ShoppingCategory = 'dry' | 'nymph' | 'streamer' | 'soft-hackle' | 'other';

export type ShoppingItem = {
  name: string;
  sizes: string;
  category: ShoppingCategory;
  descriptor?: string;
  quantity?: number;
};

export type GearItem = {
  name: string;
};

export type ForecastHour = {
  time: string;
  temp: number;
};

export type Forecast = {
  current: number;
  condition: string;
  high: number;
  low: number;
  hourly: ForecastHour[];
};
