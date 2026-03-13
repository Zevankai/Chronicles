// ============================================================
// CORE ENUMS
// ============================================================

export type TokenType = 'player' | 'monster' | 'companion' | 'storage' | 'lore' | 'npc' | 'merchant';

export type PlayerRole = 'GM' | 'PLAYER';

export type Attribute = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'TN' | 'CN' | 'LE' | 'NE' | 'CE';

export type ProficiencyLevel = 'none' | 'half' | 'proficient' | 'expertise';

export type ConditionName =
  | 'Blinded' | 'Charmed' | 'Deafened' | 'Frightened' | 'Grappled'
  | 'Incapacitated' | 'Invisible' | 'Paralyzed' | 'Petrified' | 'Poisoned'
  | 'Prone' | 'Restrained' | 'Stunned' | 'Unconscious' | 'Burning' | 'Falling';

export type InjurySeverity = 'minor' | 'severe' | 'critical';
export type BodyLocation = 'Limb' | 'Torso' | 'Head';

export type StorageType = 'SmallChest' | 'LargeChest' | 'Barrel' | 'Cart' | 'Wagon' | 'Vault' | 'Strongbox' | 'Saddlebags' | 'Custom';

export type LoreCategory = 'Location' | 'Object' | 'Landmark' | 'Historical' | 'Organization' | 'Other';

export type Biome = 'Temperate' | 'Mediterranean' | 'Tropical' | 'Desert' | 'Ocean' | 'Tundra';

export type WeatherType = 'Clear' | 'Cloudy' | 'Overcast' | 'Light Rain' | 'Heavy Rain' | 'Storm' | 'Snow' | 'Blizzard' | 'Fog' | 'Sandstorm' | 'Drizzle' | 'Hail';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type ItemCategory =
  | 'Other' | 'Large' | 'Massive' | 'Tool' | 'Kit'
  | 'Light Armor' | 'Medium Armor' | 'Heavy Armor'
  | 'Consumable' | 'Food' | 'Instrument'
  | 'One-Handed Weapon' | 'Two-Handed Weapon'
  | 'Clothing' | 'Light Ammo' | 'Ammo'
  | 'Jewelry' | 'Shield' | 'Magic Item' | 'Literature'
  | 'Camp' | 'Auxiliary' | 'Bag' | 'Helmet' | 'Greaves' | 'Boots';

export type EquipmentSlot =
  | 'Bag' | 'Auxiliary1' | 'Auxiliary2'
  | 'PrimaryHand' | 'SecondaryHand'
  | 'HeadArmor' | 'PrimaryArmor' | 'Gauntlets' | 'Boots'
  | 'Jewelry1' | 'Jewelry2' | 'Jewelry3'
  | 'Clothing1' | 'Clothing2'
  | 'Misc';

// ============================================================
// ITEM & COIN MODELS
// ============================================================

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  weight?: number; // override default category weight
  description?: string;
  value?: number; // in CP
  equipped?: EquipmentSlot | null;
  properties?: string; // notes/properties as text

  // Weapon fields
  damage?: string;
  hitModifier?: number;
  damageModifier?: number;

  // Armor/Shield fields
  acBonus?: number;

  // Attunement & Charges
  requiresAttunement?: boolean;
  attuned?: boolean;
  maxCharges?: number;
  currentCharges?: number;

  // Bag/Auxiliary fields
  unitCapacity?: number;
  itemMaxCapacity?: number;
  allowedItemTypes?: ItemCategory[];

  // Price (for merchant items - multi-currency)
  price?: Coins;
}

export interface Coins {
  cp: number;
  sp: number;
  gp: number;
  pp: number;
}

// ============================================================
// ATTRIBUTES & SKILLS
// ============================================================

export interface AttributeScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface SavingThrows {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface SkillData {
  proficiency: ProficiencyLevel;
  bonus: number;
}

export interface Skills {
  Acrobatics: SkillData;
  'Animal Handling': SkillData;
  Arcana: SkillData;
  Athletics: SkillData;
  Deception: SkillData;
  History: SkillData;
  Insight: SkillData;
  Intimidation: SkillData;
  Investigation: SkillData;
  Medicine: SkillData;
  Nature: SkillData;
  Perception: SkillData;
  Performance: SkillData;
  Persuasion: SkillData;
  Religion: SkillData;
  'Sleight of Hand': SkillData;
  Stealth: SkillData;
  Survival: SkillData;
}

// ============================================================
// CONDITIONS & INJURIES
// ============================================================

export interface Injury {
  id: string;
  severity: InjurySeverity;
  location: BodyLocation;
  description: string;
  currentHp: number; // starts at max (6/4/2), heals down to 0
  maxHp: number; // 6 for critical, 4 for severe, 2 for minor
  healed: boolean;
  scarDescription?: string; // filled in when injury fully heals
  timestamp: number;
}

export interface Scar {
  id: string;
  description: string;
  fromInjuryId?: string;
  severity: InjurySeverity;
  location: BodyLocation;
}

export interface ExhaustionLevel {
  level: number;
  effect: string;
}

// ============================================================
// REST SYSTEM
// ============================================================

export type LongRestOption = 'Eat' | 'Pray' | 'Study' | 'Work' | 'Spar' | 'Reinforce' | 'Bond' | 'Craft' | 'Scout' | 'Care' | 'Tell a Joke';
export type ShortRestOption = 'Eat' | 'Stretch' | 'Meditate' | 'Sharpen' | 'Scout' | 'Motivate' | 'Bond' | 'Tinker' | 'Study' | 'Calm' | 'Tell a Joke';

export interface RestBonus {
  restType: 'long' | 'short';
  selectedOptions: string[];
  details: Record<string, unknown>;
  used: string[];
  timestamp: number;
}

// ============================================================
// SPELL SYSTEM
// ============================================================

export interface SpellSlots {
  1: { total: number; used: number };
  2: { total: number; used: number };
  3: { total: number; used: number };
  4: { total: number; used: number };
  5: { total: number; used: number };
  6: { total: number; used: number };
  7: { total: number; used: number };
  8: { total: number; used: number };
  9: { total: number; used: number };
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0-9 (0 = cantrip)
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
  ritual: boolean;
  concentration: boolean;
}

// ============================================================
// CALENDAR & WEATHER
// ============================================================

export interface CalendarMonth {
  name: string;
  days: number;
  season?: string; // which season this month belongs to
}

export interface CalendarConfig {
  months: CalendarMonth[];
  seasons?: string[]; // e.g., ['Spring', 'Summer', 'Autumn', 'Winter']
  daysPerWeek: number;
  weekDayNames: string[];
  yearSuffix: string;
  currentYear: number;
  currentMonth: number; // 0-indexed
  currentDay: number;
  currentHour: number;
  currentMinute: number;
}

export interface WeatherData {
  type: WeatherType;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  generatedAt: string; // ISO timestamp
}

// ============================================================
// PROJECT SYSTEM
// ============================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  progressPoints: number;
  totalPoints: number;
}

// ============================================================
// PLAYER TOKEN
// ============================================================

export interface PlayerData {
  // Type
  tokenType: 'player';

  // Identity
  name: string;
  imageUrl: string;
  coverPhotoUrl: string;
  playerClass: string;
  race: string;
  level: number;
  ownerId?: string; // OBR player ID

  // Combat Stats
  currentHp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  initiativeBonus: number;
  proficiencyBonus: number;
  speed: number;

  // Attributes
  attributes: AttributeScores;

  // Saving Throws
  savingThrows: SavingThrows;

  // Passive Scores
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;

  // Skills
  skills: Skills;

  // Conditions
  conditions: ConditionName[];
  exhaustionLevel: number; // 0-10
  injuries: Injury[];
  scars: Scar[];
  favorites?: string[]; // favorite token IDs
  lastRestBonus?: RestBonus;
  lastShortRestBonus?: RestBonus;
  lastLongRestBonus?: RestBonus;

  // Character
  alignment: Alignment;
  gender: string;
  eyes: string;
  height: string;
  hair: string;
  skin: string;
  age: string;
  weight: string;
  journalUrl: string;
  languages?: string;
  classFeatures: string;
  speciesFeatures: string;
  feats: string;
  background: string;
  appearance: string;
  personality: string;
  flaws: string;
  relationships: string;

  // Equipment
  inventory: Item[];
  coins: Coins;
  bodyWeight: number; // for encumbrance calculation

  // Spells
  spellSlots: SpellSlots;
  spells: Spell[];

  // GM-Only
  xp: number;
  inspiration: boolean;
  deathSaves: { successes: number; failures: number };
  hiddenNotes: string;
  exhaustionConfig: ExhaustionLevel[];

  // Image customization
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;

  // Claim system
  claimable?: boolean;
  claimedBy?: string; // player ID

  // Projects
  projects?: Project[];

  // Meta
  version: number;
}

// ============================================================
// MONSTER TOKEN
// ============================================================

export interface MonsterAbility {
  id: string;
  name: string;
  description: string;
}

export interface MonsterAction {
  id: string;
  name: string;
  attackBonus?: number;
  damage?: string;
  description: string;
}

export type MonsterStatus = 'Alive' | 'Dead' | 'Fleeing' | 'Vulnerable';

export interface MonsterData {
  tokenType: 'monster';
  name: string;
  currentHp: number;
  maxHp: number;
  ac: number;
  speed: number;
  status: MonsterStatus;
  attributes: AttributeScores;
  abilities: MonsterAbility[];
  actions: MonsterAction[];
  conditions: ConditionName[];
  loot: Item[];
  lootCoins: Coins;
  notes: string;
  xpValue: number;
  challengeRating: string;
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// COMPANION TOKEN
// ============================================================

export interface CompanionData {
  tokenType: 'companion';
  name: string;
  ownerId: string; // player token ID
  currentHp: number;
  maxHp: number;
  ac: number;
  speed: number;
  status: MonsterStatus;
  attributes: AttributeScores;
  abilities: MonsterAbility[];
  actions: MonsterAction[];
  conditions: ConditionName[];
  inventory: Item[];
  coins: Coins;
  carryCapacity: number;
  notes: string;
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// STORAGE TOKEN
// ============================================================

export interface StorageData {
  tokenType: 'storage';
  name: string;
  storageType: StorageType;
  capacity: number;
  inventory: Item[];
  coins: Coins;
  locked: boolean;
  lockDC?: number;
  accessList?: string[]; // player IDs with access
  notes: string;
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// LORE TOKEN
// ============================================================

export interface LoreData {
  tokenType: 'lore';
  name: string;
  category: LoreCategory;
  summary: string;
  fullText: string;
  revealed: boolean; // visible to players?
  revealedTo?: string[]; // specific player IDs
  tags: string[];
  linkedTokenIds?: string[];
  notes: string; // GM only
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// NPC TOKEN
// ============================================================

export interface NPCRelationship {
  targetId: string;
  targetName: string;
  relationship: string; // e.g., "ally", "rival", "family"
  notes: string;
}

export interface NPCData {
  tokenType: 'npc';
  name: string;
  title?: string;
  race: string;
  alignment: Alignment;
  occupation: string;
  location: string;
  personality: string;
  appearance: string;
  background: string;
  motivations: string;
  secrets: string; // GM only
  relationships: NPCRelationship[];
  quests: string[];
  notes: string;
  revealed: boolean;
  revealedFields: string[]; // which fields players can see
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// MERCHANT TOKEN
// ============================================================

export interface MerchantData {
  tokenType: 'merchant';
  name: string;
  shopName: string;
  description: string;
  costInflation: number; // multiplier, default 1.0
  buybackRate: number; // fraction of value, default 0.5
  inventory: Item[];
  coins: Coins;
  notes: string; // GM only
  claimable?: boolean;
  claimedBy?: string;
  version: number;
}

// ============================================================
// ROOM METADATA
// ============================================================

export interface PendingMerchantTrade {
  id: string;
  playerId: string;
  playerName: string;
  merchantId: string;
  merchantName: string;
  playerGives: { items: { item: Item; quantity: number }[]; coins: Coins };
  merchantGives: { items: { item: Item; quantity: number }[]; coins: Coins };
  timestamp: number;
}

export interface RoomMetadata {
  calendar: CalendarConfig;
  weather: WeatherData;
  biome: Biome;
  tradeRange: number; // in squares, default 5
  itemRepository: Item[];
  spellRepository: Spell[];
  exhaustionConfig: ExhaustionLevel[];
  activeTrades?: Record<string, string>; // tokenId -> playerIdTrading
  pendingMerchantTrades?: PendingMerchantTrade[];
  version: number;
}

// ============================================================
// TRADING
// ============================================================

export type TradeParticipantType = 'player' | 'companion' | 'storage' | 'merchant' | 'monster';

export interface TradeOffer {
  participantId: string;
  participantType: TradeParticipantType;
  items: { item: Item; quantity: number }[];
  coins: Coins;
}

export interface TradeSession {
  id: string;
  initiatorId: string;
  targetId: string;
  initiatorOffer: TradeOffer;
  targetOffer: TradeOffer;
  initiatorConfirmed: boolean;
  targetConfirmed: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_approval';
  timestamp: number;
}

// ============================================================
// UNION TYPE
// ============================================================

export type AnyTokenData = PlayerData | MonsterData | CompanionData | StorageData | LoreData | NPCData | MerchantData;
