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

export function getProficiencyByLevel(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function getHalfProficiencyByLevel(level: number): number {
  if (level >= 13) return 3;
  if (level >= 9) return 2;
  return 1;
}

export function getExpertiseByLevel(level: number): number {
  return getProficiencyByLevel(level) * 2;
}

export function getProficiencyComponent(profLevel: string, level: number): number {
  switch (profLevel) {
    case 'half': return getHalfProficiencyByLevel(level);
    case 'proficient': return getProficiencyByLevel(level);
    case 'expertise': return getExpertiseByLevel(level);
    default: return 0;
  }
}

export function getSkillModifier(
  skillName: string,
  skills: Skills,
  attributes: AttributeScores,
  level: number
): number {
  const attr = SKILL_ATTRIBUTE_MAP[skillName];
  if (!attr) return 0;
  const attrMod = getModifier(attributes[attr]);
  const skillData = skills[skillName as keyof Skills];
  if (!skillData) return attrMod;
  const profComp = getProficiencyComponent(skillData.proficiency, level);
  return attrMod + profComp + (skillData.bonus || 0);
}

export function getInjuryMaxHp(severity: string): number {
  if (severity === 'critical') return 6;
  if (severity === 'severe') return 4;
  return 2;
}

export function cycleProficiency(current: string): string {
  const cycle = ['none', 'half', 'proficient', 'expertise'];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}

// ============================================================
// ENCUMBRANCE
// ============================================================

export function getInventoryWeight(inventory: Item[], coins?: Coins, bagDropped?: boolean): number {
  const itemWeight = inventory.reduce((total, item) => {
    // Equipped items do not add to encumbrance
    if (item.equipped != null) return total;
    // When bag is dropped, unequipped (bag) items don't count
    if (bagDropped) return total;
    const unitWeight = item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
    return total + unitWeight * item.quantity;
  }, 0);
  if (coins) {
    const coinWeight = (coins.cp + coins.sp + coins.gp + coins.pp) * 0.01;
    return itemWeight + coinWeight;
  }
  return itemWeight;
}

export function getPlayerCapacity(player: PlayerData): number {
  const DEFAULT_CAPACITY = 15;
  const equippedBag = player.inventory.find(
    (i) => i.category === 'Bag' && i.equipped === 'Bag'
  );
  return equippedBag?.unitCapacity != null
    ? equippedBag.unitCapacity + DEFAULT_CAPACITY
    : DEFAULT_CAPACITY;
}

export function parseBodyWeight(player: PlayerData): number {
  // Try to parse weight from character tab string (e.g. "180 lbs" -> 180)
  if (player.weight) {
    const parsed = parseFloat(player.weight);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return player.bodyWeight;
}

export function getCombatEncumberedThreshold(bodyWeight: number, strMod: number): number {
  return bodyWeight * (0.25 + 0.02 * strMod);
}

export function getOverEncumberedThreshold(bodyWeight: number, strMod: number): number {
  return bodyWeight * (0.40 + 0.02 * strMod);
}

export type EncumbranceStatus = 'normal' | 'combat' | 'over';

export function getEncumbranceStatus(player: PlayerData): EncumbranceStatus {
  const weight = getInventoryWeight(player.inventory, player.coins, player.bagDropped);
  const strMod = getModifier(player.attributes.STR);
  const bodyWeight = parseBodyWeight(player);
  if (weight >= getOverEncumberedThreshold(bodyWeight, strMod)) return 'over';
  if (weight >= getCombatEncumberedThreshold(bodyWeight, strMod)) return 'combat';
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
  const month = calendar.months[calendar.currentMonth];
  if (month?.season) return month.season;
  const totalMonths = calendar.months.length;
  const quarter = Math.floor((calendar.currentMonth / totalMonths) * 4);
  const seasons = calendar.seasons || ['Winter', 'Spring', 'Summer', 'Autumn'];
  return seasons[quarter] || 'Spring';
}

export function formatCalendarDate(calendar: CalendarConfig): string {
  const month = calendar.months[calendar.currentMonth];
  const dayName = calendar.weekDayNames[calendar.currentDay % calendar.daysPerWeek];
  return `${dayName}, ${calendar.currentDay} ${month?.name || ''}, ${calendar.currentYear} ${calendar.yearSuffix}`;
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h12}:${m} ${period}`;
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
  const temperatureC = baseTemp + seasonMod + variance + hourMod;
  const temperature = Math.round((temperatureC * 9) / 5 + 32);

  const humidity = Math.floor(Math.random() * 60) + 20;
  // Wind speed in MPH (5-44 mph range)
  const windSpeed = Math.floor(Math.random() * 40) + 5;

  return {
    type: weatherType as WeatherData['type'],
    temperature,
    humidity,
    windSpeed,
    description: `${weatherType}, ${temperature}°F, winds ${windSpeed} mph`,
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
    scars: [],
    alignment: 'TN',
    gender: '',
    eyes: '',
    height: '',
    hair: '',
    skin: '',
    age: '',
    weight: '',
    journalUrl: '',
    languages: '',
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
    features: [],
    hitDiceMax: 0,
    hitDiceRemaining: 0,
    bagDropped: false,
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
