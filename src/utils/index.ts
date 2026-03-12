import {
  AttributeScores,
  Skills,
  PlayerData,
  Item,
  Coins,
  CalendarConfig,
  WeatherData,
  Biome,
  InjurySeverity,
  BodyLocation,
} from '../types';
import {
  SKILL_ATTRIBUTE_MAP,
  ITEM_CATEGORY_WEIGHTS,
  BIOME_BASE_TEMPS,
  SEASON_TEMP_MODS,
  WEATHER_TABLES,
  COINS_TO_CP,
} from '../constants';

// ============================================================
// ATTRIBUTE CALCULATIONS
// ============================================================

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getModifierString(score: number): string {
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyComponent(profLevel: string, profBonus: number): number {
  switch (profLevel) {
    case 'half': return Math.floor(profBonus / 2);
    case 'proficient': return profBonus;
    case 'expertise': return profBonus * 2;
    default: return 0;
  }
}

export function getSkillModifier(
  skillName: string,
  skills: Skills,
  attributes: AttributeScores,
  profBonus: number
): number {
  const attr = SKILL_ATTRIBUTE_MAP[skillName];
  if (!attr) return 0;
  const attrMod = getModifier(attributes[attr]);
  const skillData = skills[skillName as keyof Skills];
  if (!skillData) return attrMod;
  const profComp = getProficiencyComponent(skillData.proficiency, profBonus);
  return attrMod + profComp + (skillData.bonus || 0);
}

export function cycleProficiency(current: string): string {
  const cycle = ['none', 'half', 'proficient', 'expertise'];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}

// ============================================================
// ENCUMBRANCE
// ============================================================

export function getInventoryWeight(inventory: Item[]): number {
  return inventory.reduce((total, item) => {
    const unitWeight = item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
    return total + unitWeight * item.quantity;
  }, 0);
}

export function getCombatEncumberedThreshold(bodyWeight: number, strMod: number): number {
  return bodyWeight * (0.25 + 0.02 * strMod);
}

export function getOverEncumberedThreshold(bodyWeight: number, strMod: number): number {
  return bodyWeight * (0.40 + 0.02 * strMod);
}

export type EncumbranceStatus = 'normal' | 'combat' | 'over';

export function getEncumbranceStatus(player: PlayerData): EncumbranceStatus {
  const weight = getInventoryWeight(player.inventory);
  const strMod = getModifier(player.attributes.STR);
  if (weight >= getOverEncumberedThreshold(player.bodyWeight, strMod)) return 'over';
  if (weight >= getCombatEncumberedThreshold(player.bodyWeight, strMod)) return 'combat';
  return 'normal';
}

// ============================================================
// COIN CALCULATIONS
// ============================================================

export function coinsToCP(coins: Coins): number {
  return (
    coins.cp * COINS_TO_CP.cp +
    coins.sp * COINS_TO_CP.sp +
    coins.gp * COINS_TO_CP.gp +
    coins.pp * COINS_TO_CP.pp
  );
}

export function cpToCoins(cp: number): Coins {
  const pp = Math.floor(cp / COINS_TO_CP.pp);
  cp -= pp * COINS_TO_CP.pp;
  const gp = Math.floor(cp / COINS_TO_CP.gp);
  cp -= gp * COINS_TO_CP.gp;
  const sp = Math.floor(cp / COINS_TO_CP.sp);
  cp -= sp * COINS_TO_CP.sp;
  return { pp, gp, sp, cp };
}

// ============================================================
// INJURY CALCULATIONS
// ============================================================

export function getInjurySeverity(damage: number, maxHp: number): InjurySeverity | null {
  const ratio = damage / maxHp;
  if (ratio >= 0.5) return 'critical';
  if (ratio >= 0.25) return 'severe';
  if (ratio >= 0.1) return 'minor';
  return null;
}

export function getBodyLocation(): BodyLocation {
  const locations: BodyLocation[] = ['Limb', 'Torso', 'Head'];
  return locations[Math.floor(Math.random() * locations.length)];
}

// ============================================================
// CALENDAR UTILITIES
// ============================================================

export function getSeason(calendar: CalendarConfig): string {
  const totalMonths = calendar.months.length;
  const month = calendar.currentMonth;
  const quarter = Math.floor((month / totalMonths) * 4);
  return ['Winter', 'Spring', 'Summer', 'Autumn'][quarter] || 'Spring';
}

export function formatCalendarDate(calendar: CalendarConfig): string {
  const month = calendar.months[calendar.currentMonth];
  const dayName = calendar.weekDayNames[calendar.currentDay % calendar.daysPerWeek];
  return `${dayName}, ${calendar.currentDay} ${month?.name || ''}, ${calendar.currentYear} ${calendar.yearSuffix}`;
}

export function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function advanceCalendar(calendar: CalendarConfig, hours: number): CalendarConfig {
  let { currentMinute, currentHour, currentDay, currentMonth, currentYear } = calendar;
  currentHour += hours;

  while (currentHour >= 24) {
    currentHour -= 24;
    currentDay += 1;
    const daysInMonth = calendar.months[currentMonth]?.days || 30;
    if (currentDay > daysInMonth) {
      currentDay = 1;
      currentMonth += 1;
      if (currentMonth >= calendar.months.length) {
        currentMonth = 0;
        currentYear += 1;
      }
    }
  }

  return { ...calendar, currentMinute, currentHour, currentDay, currentMonth, currentYear };
}

// ============================================================
// WEATHER GENERATION
// ============================================================

function weightedRandom(options: { type: string; weight: number }[]): string {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const option of options) {
    r -= option.weight;
    if (r <= 0) return option.type;
  }
  return options[options.length - 1].type;
}

export function generateWeather(biome: Biome, calendar: CalendarConfig): WeatherData {
  const season = getSeason(calendar);
  const biomeTable = WEATHER_TABLES[biome] || WEATHER_TABLES.Temperate;
  const seasonTable = biomeTable[season] || biomeTable.Spring;

  const weatherType = weightedRandom(seasonTable);
  const baseTemp = BIOME_BASE_TEMPS[biome] || 15;
  const seasonMod = SEASON_TEMP_MODS[season] || 0;
  const variance = Math.floor(Math.random() * 10) - 5;
  const hourMod = calendar.currentHour >= 12 && calendar.currentHour <= 16 ? 3 : calendar.currentHour < 6 || calendar.currentHour > 20 ? -5 : 0;
  const temperature = baseTemp + seasonMod + variance + hourMod;

  const humidity = Math.floor(Math.random() * 60) + 20;
  const windSpeed = Math.floor(Math.random() * 40) + 5;

  return {
    type: weatherType as WeatherData['type'],
    temperature,
    humidity,
    windSpeed,
    description: `${weatherType}, ${temperature}°C, winds ${windSpeed}km/h`,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================
// ID GENERATION
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================
// DEFAULT DATA FACTORIES
// ============================================================

export function createDefaultPlayerData(): PlayerData {
  return {
    tokenType: 'player',
    name: 'New Character',
    imageUrl: '',
    coverPhotoUrl: '',
    playerClass: '',
    race: '',
    level: 1,
    currentHp: 10,
    maxHp: 10,
    tempHp: 0,
    ac: 10,
    initiativeBonus: 0,
    proficiencyBonus: 2,
    speed: 30,
    attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    savingThrows: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    skills: {
      Acrobatics: { proficiency: 'none', bonus: 0 },
      'Animal Handling': { proficiency: 'none', bonus: 0 },
      Arcana: { proficiency: 'none', bonus: 0 },
      Athletics: { proficiency: 'none', bonus: 0 },
      Deception: { proficiency: 'none', bonus: 0 },
      History: { proficiency: 'none', bonus: 0 },
      Insight: { proficiency: 'none', bonus: 0 },
      Intimidation: { proficiency: 'none', bonus: 0 },
      Investigation: { proficiency: 'none', bonus: 0 },
      Medicine: { proficiency: 'none', bonus: 0 },
      Nature: { proficiency: 'none', bonus: 0 },
      Perception: { proficiency: 'none', bonus: 0 },
      Performance: { proficiency: 'none', bonus: 0 },
      Persuasion: { proficiency: 'none', bonus: 0 },
      Religion: { proficiency: 'none', bonus: 0 },
      'Sleight of Hand': { proficiency: 'none', bonus: 0 },
      Stealth: { proficiency: 'none', bonus: 0 },
      Survival: { proficiency: 'none', bonus: 0 },
    },
    conditions: [],
    exhaustionLevel: 0,
    injuries: [],
    alignment: 'TN',
    gender: '',
    eyes: '',
    height: '',
    hair: '',
    skin: '',
    age: '',
    weight: '',
    journalUrl: '',
    classFeatures: '',
    speciesFeatures: '',
    feats: '',
    background: '',
    appearance: '',
    personality: '',
    flaws: '',
    relationships: '',
    inventory: [],
    coins: { cp: 0, sp: 0, gp: 0, pp: 0 },
    bodyWeight: 70,
    spellSlots: {
      1: { total: 0, used: 0 },
      2: { total: 0, used: 0 },
      3: { total: 0, used: 0 },
      4: { total: 0, used: 0 },
      5: { total: 0, used: 0 },
      6: { total: 0, used: 0 },
      7: { total: 0, used: 0 },
      8: { total: 0, used: 0 },
      9: { total: 0, used: 0 },
    },
    spells: [],
    xp: 0,
    inspiration: false,
    deathSaves: { successes: 0, failures: 0 },
    hiddenNotes: '',
    exhaustionConfig: [],
    version: 1,
  };
}

export function createDefaultMonsterData(): import('../types').MonsterData {
  return {
    tokenType: 'monster',
    name: 'Monster',
    currentHp: 20,
    maxHp: 20,
    ac: 12,
    speed: 30,
    status: 'Alive',
    attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    abilities: [],
    actions: [],
    conditions: [],
    loot: [],
    lootCoins: { cp: 0, sp: 0, gp: 0, pp: 0 },
    notes: '',
    xpValue: 0,
    challengeRating: '1/4',
    version: 1,
  };
}
