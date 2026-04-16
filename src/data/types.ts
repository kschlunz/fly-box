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

export type TackleBoxFly = {
  id: string;
  name: string;
  normalizedName: string;
  size: string | null;
  role: FlyRole;
  category: string;
  colors: string | null;
  description: string | null;
  primaryPhotoUrl: string;
  photoQualityScore: number;
  count: number;
  photoCount: number;
  notes: string | null;
  firstIdentifiedAt: string;
  lastIdentifiedAt: string;
};

export type TackleBoxPhoto = {
  id: string;
  photoUrl: string;
  qualityScore: number;
  isPrimary: boolean;
  createdAt: string;
};

export type IdentifyResponse = {
  identification: {
    name: string;
    sizeRange: string;
    role: FlyRole;
    confidence: 'high' | 'medium' | 'low';
    notes: string;
    alternates: string[];
    category: string;
    colors: string;
    photoQuality: number;
  };
  tackleBox: {
    id: string;
    isNewEntry: boolean;
    count: number;
    photoUpdated: boolean;
    previousPhotoQuality: number | null;
  };
  shoppingMatch: {
    matched: boolean;
    itemKey: string | null;
  };
};
