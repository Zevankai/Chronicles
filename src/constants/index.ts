import { Attribute, ItemCategory, StorageType, ExhaustionLevel } from '../types';

// ============================================================
// METADATA NAMESPACES
// ============================================================

export const TOKEN_NAMESPACE = 'com.chronicles';
export const ROOM_NAMESPACE = 'com.chronicles.room';

// ============================================================
// SKILLS & ATTRIBUTES
// ============================================================

export const SKILL_ATTRIBUTE_MAP: Record<string, Attribute> = {
  Acrobatics: 'DEX',
  'Animal Handling': 'WIS',
  Arcana: 'INT',
  Athletics: 'STR',
  Deception: 'CHA',
  History: 'INT',
  Insight: 'WIS',
  Intimidation: 'CHA',
  Investigation: 'INT',
  Medicine: 'WIS',
  Nature: 'INT',
  Perception: 'WIS',
  Performance: 'CHA',
  Persuasion: 'CHA',
  Religion: 'INT',
  'Sleight of Hand': 'DEX',
  Stealth: 'DEX',
  Survival: 'WIS',
};

export const SKILL_NAMES = Object.keys(SKILL_ATTRIBUTE_MAP);

export const ATTRIBUTES: Attribute[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

// ============================================================
// CONDITIONS
// ============================================================

export const ALL_CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Burning', 'Falling',
] as const;

// ============================================================
// ITEM CATEGORIES & WEIGHTS
// ============================================================

export const ITEM_CATEGORY_WEIGHTS: Record<ItemCategory, number> = {
  Other: 1,
  Large: 10,
  Massive: 50,
  Tool: 2,
  Kit: 1,
  'Light Armor': 5,
  'Medium Armor': 8,
  'Heavy Armor': 12,
  Consumable: 0.5,
  Food: 0.25,
  Instrument: 2,
  'One-Handed Weapon': 2,
  'Two-Handed Weapon': 4,
  Clothing: 3,
  'Light Ammo': 1,
  Ammo: 0.1,
  Jewelry: 0.1,
  Shield: 3,
  'Magic Item': 2,
  Literature: 1,
  Camp: 3,
  Auxiliary: 2,
  'Animal Auxiliary': 3,
  Bag: 3,
  Helmet: 2,
  Greaves: 2,
  Boots: 2,
};

export const ITEM_CATEGORIES: ItemCategory[] = Object.keys(ITEM_CATEGORY_WEIGHTS) as ItemCategory[];

// ============================================================
// STORAGE CAPACITIES
// ============================================================

export const STORAGE_CAPACITIES: Record<StorageType, number> = {
  SmallChest: 30,
  LargeChest: 60,
  Barrel: 40,
  Cart: 200,
  Wagon: 500,
  Vault: 1000,
  Strongbox: 15,
  Saddlebags: 20,
  Custom: 50,
};

// ============================================================
// DEFAULT EXHAUSTION CONFIG
// ============================================================

export const DEFAULT_EXHAUSTION_EFFECTS: ExhaustionLevel[] = [
  { level: 1, effect: 'Disadvantage on ability checks' },
  { level: 2, effect: 'Speed reduced by 10ft' },
  { level: 3, effect: 'Speed halved' },
  { level: 4, effect: 'Disadvantage on attack rolls' },
  { level: 5, effect: 'Disadvantage on saving throws' },
  { level: 6, effect: 'HP maximum reduced by 25%' },
  { level: 7, effect: 'HP maximum halved' },
  { level: 8, effect: 'Speed reduced to 0' },
  { level: 9, effect: 'Unconscious' },
  { level: 10, effect: 'Death' },
];

// ============================================================
// REST OPTIONS
// ============================================================

export const LONG_REST_OPTIONS = ['Eat', 'Pray', 'Study', 'Work', 'Spar', 'Reinforce', 'Bond', 'Craft', 'Scout', 'Care', 'Tell a Joke'];
export const SHORT_REST_OPTIONS = ['Eat', 'Stretch', 'Meditate', 'Sharpen', 'Scout', 'Motivate', 'Bond', 'Tinker', 'Study', 'Calm', 'Tell a Joke'];
export const LONG_REST_PICK = 3;
export const SHORT_REST_PICK = 2;

// ============================================================
// ALIGNMENTS
// ============================================================

export const ALIGNMENTS = [
  { value: 'LG', label: 'Lawful Good' },
  { value: 'NG', label: 'Neutral Good' },
  { value: 'CG', label: 'Chaotic Good' },
  { value: 'LN', label: 'Lawful Neutral' },
  { value: 'TN', label: 'True Neutral' },
  { value: 'CN', label: 'Chaotic Neutral' },
  { value: 'LE', label: 'Lawful Evil' },
  { value: 'NE', label: 'Neutral Evil' },
  { value: 'CE', label: 'Chaotic Evil' },
];

// ============================================================
// CALENDAR DEFAULTS
// ============================================================

export const DEFAULT_CALENDAR = {
  months: [
    { name: 'Deepwinter', days: 30, season: 'Winter' },
    { name: 'Coldmonth', days: 28, season: 'Winter' },
    { name: 'Thawmonth', days: 31, season: 'Spring' },
    { name: 'Seedmonth', days: 30, season: 'Spring' },
    { name: 'Bloommonth', days: 31, season: 'Spring' },
    { name: 'Sunmonth', days: 30, season: 'Summer' },
    { name: 'Highheat', days: 31, season: 'Summer' },
    { name: 'Harvestmonth', days: 31, season: 'Summer' },
    { name: 'Fallmonth', days: 30, season: 'Autumn' },
    { name: 'Dimmonth', days: 31, season: 'Autumn' },
    { name: 'Frostmonth', days: 30, season: 'Winter' },
    { name: 'Darkmonth', days: 31, season: 'Winter' },
  ],
  seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
  daysPerWeek: 7,
  weekDayNames: ['Moonday', 'Tideday', 'Windsday', 'Earthday', 'Fireday', 'Starsday', 'Sunday'],
  yearSuffix: 'DR',
  currentYear: 1492,
  currentMonth: 0,
  currentDay: 1,
  currentHour: 8,
  currentMinute: 0,
};

// ============================================================
// WEATHER TABLES BY BIOME & SEASON
// ============================================================

export const WEATHER_TABLES: Record<string, Record<string, { type: string; weight: number }[]>> = {
  Temperate: {
    Spring: [
      { type: 'Clear', weight: 20 },
      { type: 'Cloudy', weight: 20 },
      { type: 'Light Rain', weight: 25 },
      { type: 'Heavy Rain', weight: 15 },
      { type: 'Fog', weight: 10 },
      { type: 'Storm', weight: 10 },
    ],
    Summer: [
      { type: 'Clear', weight: 40 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Light Rain', weight: 15 },
      { type: 'Heavy Rain', weight: 10 },
      { type: 'Storm', weight: 10 },
    ],
    Autumn: [
      { type: 'Cloudy', weight: 30 },
      { type: 'Light Rain', weight: 25 },
      { type: 'Heavy Rain', weight: 20 },
      { type: 'Clear', weight: 15 },
      { type: 'Fog', weight: 10 },
    ],
    Winter: [
      { type: 'Snow', weight: 30 },
      { type: 'Overcast', weight: 25 },
      { type: 'Clear', weight: 20 },
      { type: 'Blizzard', weight: 15 },
      { type: 'Fog', weight: 10 },
    ],
  },
  Mediterranean: {
    Spring: [
      { type: 'Clear', weight: 35 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Light Rain', weight: 25 },
      { type: 'Drizzle', weight: 15 },
    ],
    Summer: [
      { type: 'Clear', weight: 60 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Drizzle', weight: 15 },
    ],
    Autumn: [
      { type: 'Clear', weight: 25 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Light Rain', weight: 30 },
      { type: 'Heavy Rain', weight: 20 },
    ],
    Winter: [
      { type: 'Light Rain', weight: 35 },
      { type: 'Heavy Rain', weight: 25 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Clear', weight: 15 },
    ],
  },
  Tropical: {
    Spring: [
      { type: 'Heavy Rain', weight: 35 },
      { type: 'Storm', weight: 25 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Clear', weight: 15 },
    ],
    Summer: [
      { type: 'Storm', weight: 30 },
      { type: 'Heavy Rain', weight: 35 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Clear', weight: 10 },
    ],
    Autumn: [
      { type: 'Heavy Rain', weight: 30 },
      { type: 'Storm', weight: 20 },
      { type: 'Cloudy', weight: 30 },
      { type: 'Clear', weight: 20 },
    ],
    Winter: [
      { type: 'Clear', weight: 40 },
      { type: 'Cloudy', weight: 30 },
      { type: 'Light Rain', weight: 20 },
      { type: 'Drizzle', weight: 10 },
    ],
  },
  Desert: {
    Spring: [
      { type: 'Clear', weight: 55 },
      { type: 'Sandstorm', weight: 20 },
      { type: 'Cloudy', weight: 15 },
      { type: 'Drizzle', weight: 10 },
    ],
    Summer: [
      { type: 'Clear', weight: 65 },
      { type: 'Sandstorm', weight: 25 },
      { type: 'Overcast', weight: 10 },
    ],
    Autumn: [
      { type: 'Clear', weight: 60 },
      { type: 'Sandstorm', weight: 20 },
      { type: 'Cloudy', weight: 20 },
    ],
    Winter: [
      { type: 'Clear', weight: 55 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Light Rain', weight: 10 },
      { type: 'Fog', weight: 10 },
    ],
  },
  Ocean: {
    Spring: [
      { type: 'Cloudy', weight: 30 },
      { type: 'Light Rain', weight: 25 },
      { type: 'Clear', weight: 20 },
      { type: 'Heavy Rain', weight: 15 },
      { type: 'Storm', weight: 10 },
    ],
    Summer: [
      { type: 'Clear', weight: 35 },
      { type: 'Cloudy', weight: 30 },
      { type: 'Light Rain', weight: 20 },
      { type: 'Storm', weight: 15 },
    ],
    Autumn: [
      { type: 'Storm', weight: 25 },
      { type: 'Heavy Rain', weight: 25 },
      { type: 'Cloudy', weight: 25 },
      { type: 'Clear', weight: 15 },
      { type: 'Fog', weight: 10 },
    ],
    Winter: [
      { type: 'Storm', weight: 30 },
      { type: 'Heavy Rain', weight: 25 },
      { type: 'Overcast', weight: 25 },
      { type: 'Fog', weight: 20 },
    ],
  },
  Tundra: {
    Spring: [
      { type: 'Snow', weight: 30 },
      { type: 'Overcast', weight: 30 },
      { type: 'Clear', weight: 25 },
      { type: 'Fog', weight: 15 },
    ],
    Summer: [
      { type: 'Clear', weight: 35 },
      { type: 'Overcast', weight: 30 },
      { type: 'Light Rain', weight: 20 },
      { type: 'Fog', weight: 15 },
    ],
    Autumn: [
      { type: 'Snow', weight: 35 },
      { type: 'Overcast', weight: 30 },
      { type: 'Blizzard', weight: 20 },
      { type: 'Clear', weight: 15 },
    ],
    Winter: [
      { type: 'Blizzard', weight: 35 },
      { type: 'Snow', weight: 35 },
      { type: 'Overcast', weight: 20 },
      { type: 'Clear', weight: 10 },
    ],
  },
};

export const BIOME_BASE_TEMPS: Record<string, number> = {
  Temperate: 15,
  Mediterranean: 20,
  Tropical: 28,
  Desert: 35,
  Ocean: 18,
  Tundra: -10,
};

export const SEASON_TEMP_MODS: Record<string, number> = {
  Spring: 0,
  Summer: 8,
  Autumn: -5,
  Winter: -15,
};

// ============================================================
// COIN CONVERSION
// ============================================================

export const COINS_TO_CP: Record<string, number> = {
  cp: 1,
  sp: 10,
  gp: 100,
  pp: 1000,
};

// ============================================================
// DEFAULT VALUES
// ============================================================

export const DEFAULT_TRADE_RANGE = 5; // squares
export const DEFAULT_AC = 10;
export const DEFAULT_PROFICIENCY_BONUS = 2;
export const DEFAULT_SPEED = 30;

// ============================================================
// COMPANION SIZE CAPACITIES
// ============================================================

export const COMPANION_SIZE_CAPACITY: Record<string, number> = {
  tiny: 2,
  small: 6,
  medium: 60,
  large: 500,
};

/** Base carry capacity without any animal auxiliary bags equipped (for medium/large). */
export const COMPANION_SIZE_BASE_CAPACITY: Record<string, number> = {
  tiny: 2,
  small: 6,
  medium: 5,
  large: 20,
};

export const COMPANION_SIZE_MAX_ANIMAL_AUX: Record<string, number> = {
  tiny: 0,
  small: 0,
  medium: 2,
  large: 4,
};

// ============================================================
// SPELLCASTING CONSTANTS
// ============================================================

export const FULL_CASTERS = ['wizard', 'cleric', 'druid', 'bard', 'sorcerer'] as const;
export const HALF_CASTERS = ['paladin', 'ranger'] as const;
export const PACT_CASTERS = ['warlock'] as const;
export const THIRD_CASTERS = ['eldritch knight', 'arcane trickster'] as const;
export const ALL_CASTERS = [...FULL_CASTERS, ...HALF_CASTERS, ...PACT_CASTERS, ...THIRD_CASTERS] as const;
export const PREPARED_CASTERS = ['wizard', 'cleric', 'druid', 'paladin'] as const;

export const SPELLCASTING_ABILITY: Record<string, 'INT' | 'WIS' | 'CHA'> = {
  wizard: 'INT',
  cleric: 'WIS',
  druid: 'WIS',
  bard: 'CHA',
  sorcerer: 'CHA',
  paladin: 'CHA',
  ranger: 'WIS',
  warlock: 'CHA',
  'eldritch knight': 'INT',
  'arcane trickster': 'INT',
};

// Full caster spell slot table (levels 1–20)
export const FULL_CASTER_SLOTS: Record<number, Record<number, number>> = {
  1:  { 1: 2 },
  2:  { 1: 3 },
  3:  { 1: 4, 2: 2 },
  4:  { 1: 4, 2: 3 },
  5:  { 1: 4, 2: 3, 3: 2 },
  6:  { 1: 4, 2: 3, 3: 3 },
  7:  { 1: 4, 2: 3, 3: 3, 4: 1 },
  8:  { 1: 4, 2: 3, 3: 3, 4: 2 },
  9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

// Warlock pact magic table: { slots, level } per class level
export const WARLOCK_PACT_SLOTS: Record<number, { slots: number; level: number }> = {
  1:  { slots: 1, level: 1 },
  2:  { slots: 2, level: 1 },
  3:  { slots: 2, level: 2 },
  4:  { slots: 2, level: 2 },
  5:  { slots: 2, level: 3 },
  6:  { slots: 2, level: 3 },
  7:  { slots: 2, level: 4 },
  8:  { slots: 2, level: 4 },
  9:  { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};
