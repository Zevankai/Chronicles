import { Item, ItemCategory } from '../types';

export type ItemRepositoryEntry = Omit<Item, 'id' | 'quantity' | 'equipped'> & {
  itemType: string;  // game classification e.g. "Simple Melee Weapons"
  valueText: string; // human-readable price e.g. "25 gp"
};

export const ITEM_REPOSITORY: ItemRepositoryEntry[] = [
  // ────────────────────────────────────────────────
  // SIMPLE MELEE WEAPONS
  // ────────────────────────────────────────────────
  { name: 'Club', valueText: '1 sp', damage: '1d4 Bludgeon', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Light' },
  { name: 'Dagger', valueText: '2 gp', damage: '1d4 Piercing', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light, Thrown (20/60)' },
  { name: 'Greatclub', valueText: '2 sp', damage: '1d8 Bludgeon', weight: 10, itemType: 'Simple Melee Weapons', category: 'Two-Handed Weapon', properties: '' },
  { name: 'Handaxe', valueText: '5 gp', damage: '1d6 Slashing', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Light, Thrown (20/60)' },
  { name: 'Javelin', valueText: '5 sp', damage: '1d6 Piercing', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Thrown (30/120)' },
  { name: 'Light Hammer', valueText: '2 gp', damage: '1d4 Bludgeon', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Light, Thrown (20/60)' },
  { name: 'Mace', valueText: '5 gp', damage: '1d6 Bludgeon', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: '' },
  { name: 'Quarterstaff', valueText: '2 sp', damage: '1d6 Bludgeon', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Versatile (1d8)' },
  { name: 'Sickle', valueText: '1 gp', damage: '1d4 Slashing', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Light' },
  { name: 'Spear', valueText: '1 gp', damage: '1d6 Piercing', weight: 3, itemType: 'Simple Melee Weapons', category: 'One-Handed Weapon', properties: 'Thrown (20/60), Versatile (1d8)' },

  // ────────────────────────────────────────────────
  // SIMPLE RANGED WEAPONS
  // ────────────────────────────────────────────────
  { name: 'Crossbow, light', valueText: '25 gp', damage: '1d8 Piercing', weight: 5, itemType: 'Simple Ranged Weapons', category: 'Two-Handed Weapon', properties: 'Ammunition (80/320), Loading, Two-Handed' },
  { name: 'Dart', valueText: '5 cp', damage: '1d4 Piercing', weight: 1, itemType: 'Simple Ranged Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Thrown (20/60)' },
  { name: 'Shortbow', valueText: '25 gp', damage: '1d6 Piercing', weight: 2, itemType: 'Simple Ranged Weapons', category: 'Two-Handed Weapon', properties: 'Ammunition (80/320), Two-Handed' },
  { name: 'Sling', valueText: '1 sp', damage: '1d4 Bludgeon', weight: 0, itemType: 'Simple Ranged Weapons', category: 'One-Handed Weapon', properties: 'Ammunition (30/120)' },

  // ────────────────────────────────────────────────
  // MARTIAL MELEE WEAPONS
  // ────────────────────────────────────────────────
  { name: 'Battleaxe', valueText: '10 gp', damage: '1d8 Slashing', weight: 4, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Versatile (1d10)' },
  { name: 'Flail', valueText: '10 gp', damage: '1d8 Bludgeon', weight: 3, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: '' },
  { name: 'Glaive', valueText: '20 gp', damage: '1d10 Slashing', weight: 6, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Reach, Two-Handed' },
  { name: 'Greataxe', valueText: '30 gp', damage: '1d12 Slashing', weight: 7, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Two-Handed' },
  { name: 'Greatsword', valueText: '50 gp', damage: '2d6 Slashing', weight: 6, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Two-Handed' },
  { name: 'Halberd', valueText: '20 gp', damage: '1d10 Slashing', weight: 6, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Reach, Two-Handed' },
  { name: 'Lance', valueText: '10 gp', damage: '1d12 Piercing', weight: 6, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Reach, Special' },
  { name: 'Longsword', valueText: '15 gp', damage: '1d8 Slashing', weight: 3, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Versatile (1d10)' },
  { name: 'Maul', valueText: '10 gp', damage: '2d6 Bludgeon', weight: 10, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Two-Handed' },
  { name: 'Morningstar', valueText: '15 gp', damage: '1d8 Piercing', weight: 4, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: '' },
  { name: 'Pike', valueText: '5 gp', damage: '1d10 Piercing', weight: 18, itemType: 'Martial Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Reach, Two-Handed' },
  { name: 'Rapier', valueText: '25 gp', damage: '1d8 Piercing', weight: 2, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse' },
  { name: 'Scimitar', valueText: '25 gp', damage: '1d6 Slashing', weight: 3, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light' },
  { name: 'Shortsword', valueText: '10 gp', damage: '1d6 Slashing', weight: 2, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light' },
  { name: 'Trident', valueText: '5 gp', damage: '1d6 Piercing', weight: 4, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Thrown (20/60), Versatile (1d8)' },
  { name: 'War Pick', valueText: '5 gp', damage: '1d8 Piercing', weight: 2, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: '' },
  { name: 'Warhammer', valueText: '15 gp', damage: '1d8 Bludgeon', weight: 2, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Versatile (1d10)' },
  { name: 'Whip', valueText: '2 gp', damage: '1d4 Slashing', weight: 3, itemType: 'Martial Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Reach' },

  // ────────────────────────────────────────────────
  // MARTIAL RANGED WEAPONS
  // ────────────────────────────────────────────────
  { name: 'Blowgun', valueText: '10 gp', damage: '1 Piercing', weight: 1, itemType: 'Martial Ranged Weapons', category: 'One-Handed Weapon', properties: 'Ammunition (25/100), Loading' },
  { name: 'Crossbow, hand', valueText: '75 gp', damage: '1d6 Piercing', weight: 3, itemType: 'Martial Ranged Weapons', category: 'One-Handed Weapon', properties: 'Ammunition (30/120), Light, Loading' },
  { name: 'Crossbow, heavy', valueText: '50 gp', damage: '1d10 Piercing', weight: 18, itemType: 'Martial Ranged Weapons', category: 'Two-Handed Weapon', properties: 'Ammunition (100/400), Heavy, Loading, Two-Handed' },
  { name: 'Longbow', valueText: '50 gp', damage: '1d8 Piercing', weight: 2, itemType: 'Martial Ranged Weapons', category: 'Two-Handed Weapon', properties: 'Ammunition (150/600), Heavy, Two-Handed' },
  { name: 'Net', valueText: '1 gp', weight: 3, itemType: 'Martial Ranged Weapons', category: 'One-Handed Weapon', properties: 'Special, Thrown (5/15)' },

  // ────────────────────────────────────────────────
  // LIGHT ARMOR
  // ────────────────────────────────────────────────
  { name: 'Padded', valueText: '5 gp', acBonus: 11, weight: 8, itemType: 'Light Armor', category: 'Light Armor', properties: 'Disadvantage on Stealth' },
  { name: 'Leather', valueText: '10 gp', acBonus: 11, weight: 10, itemType: 'Light Armor', category: 'Light Armor', properties: '' },
  { name: 'Studded Leather', valueText: '45 gp', acBonus: 12, weight: 13, itemType: 'Light Armor', category: 'Light Armor', properties: '' },

  // ────────────────────────────────────────────────
  // MEDIUM ARMOR
  // ────────────────────────────────────────────────
  { name: 'Hide', valueText: '10 gp', acBonus: 12, weight: 12, itemType: 'Medium Armor', category: 'Medium Armor', properties: '' },
  { name: 'Chain Shirt', valueText: '50 gp', acBonus: 13, weight: 20, itemType: 'Medium Armor', category: 'Medium Armor', properties: '' },
  { name: 'Scale Mail', valueText: '50 gp', acBonus: 14, weight: 45, itemType: 'Medium Armor', category: 'Medium Armor', properties: 'Disadvantage on Stealth' },
  { name: 'Breastplate', valueText: '400 gp', acBonus: 14, weight: 20, itemType: 'Medium Armor', category: 'Medium Armor', properties: '' },
  { name: 'Half Plate', valueText: '750 gp', acBonus: 15, weight: 40, itemType: 'Medium Armor', category: 'Medium Armor', properties: 'Disadvantage on Stealth' },

  // ────────────────────────────────────────────────
  // HEAVY ARMOR
  // ────────────────────────────────────────────────
  { name: 'Ring Mail', valueText: '30 gp', acBonus: 14, weight: 40, itemType: 'Heavy Armor', category: 'Heavy Armor', properties: 'Disadvantage on Stealth' },
  { name: 'Chain Mail', valueText: '75 gp', acBonus: 16, weight: 55, itemType: 'Heavy Armor', category: 'Heavy Armor', properties: 'Disadvantage on Stealth - Strength 13' },
  { name: 'Splint', valueText: '200 gp', acBonus: 17, weight: 60, itemType: 'Heavy Armor', category: 'Heavy Armor', properties: 'Disadvantage on Stealth - Strength 15' },
  { name: 'Plate', valueText: '1,500 gp', acBonus: 18, weight: 65, itemType: 'Heavy Armor', category: 'Heavy Armor', properties: 'Disadvantage on Stealth - Strength 15' },

  // ────────────────────────────────────────────────
  // SHIELD
  // ────────────────────────────────────────────────
  { name: 'Shield', valueText: '10 gp', acBonus: 2, weight: 6, itemType: 'Shield', category: 'Shield', properties: '' },

  // ────────────────────────────────────────────────
  // AMMUNITION
  // ────────────────────────────────────────────────
  { name: 'Arrows (20)', valueText: '1 gp', weight: 1, itemType: 'Ammunition', category: 'Ammo', properties: '' },
  { name: 'Blowgun Needles (50)', valueText: '1 gp', weight: 1, itemType: 'Ammunition', category: 'Ammo', properties: '' },
  { name: 'Crossbow Bolts (20)', valueText: '1 gp', weight: 1.5, itemType: 'Ammunition', category: 'Ammo', properties: '' },
  { name: 'Sling Bullets (20)', valueText: '4 cp', weight: 1.5, itemType: 'Ammunition', category: 'Ammo', properties: '' },

  // ────────────────────────────────────────────────
  // ADVENTURING GEAR
  // ────────────────────────────────────────────────
  { name: 'Abacus', valueText: '2 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Acid (vial)', valueText: '25 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: "Alchemist's Fire (flask)", valueText: '50 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: 'Antitoxin (vial)', valueText: '50 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: 'Backpack', valueText: '2 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Bag', properties: '' },
  { name: 'Ball Bearings (bag of 1000)', valueText: '1 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Bedroll', valueText: '1 gp', weight: 7, itemType: 'Adventuring Gear', category: 'Camp', properties: '' },
  { name: 'Bell', valueText: '1 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Blanket', valueText: '5 sp', weight: 3, itemType: 'Adventuring Gear', category: 'Camp', properties: '' },
  { name: 'Block and Tackle', valueText: '1 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Book', valueText: '25 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Literature', properties: '' },
  { name: 'Bottle, glass', valueText: '2 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Bucket', valueText: '5 cp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Caltrops (bag of 20)', valueText: '1 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Candle', valueText: '1 cp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Case, crossbow bolt', valueText: '1 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Case, map or scroll', valueText: '1 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: "Climber's Kit", valueText: '25 gp', weight: 12, itemType: 'Adventuring Gear', category: 'Kit', properties: '' },
  { name: 'Component Pouch', valueText: '25 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Crowbar', valueText: '2 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Fishing Tackle', valueText: '1 gp', weight: 4, itemType: 'Adventuring Gear', category: 'Kit', properties: '' },
  { name: 'Flask or Tankard', valueText: '2 cp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Grappling Hook', valueText: '2 gp', weight: 4, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Hammer', valueText: '1 gp', weight: 3, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Hammer, sledge', valueText: '2 gp', weight: 10, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: "Healer's Kit", valueText: '5 gp', weight: 3, itemType: 'Adventuring Gear', category: 'Kit', properties: '' },
  { name: 'Holy Water (flask)', valueText: '25 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: 'Hourglass', valueText: '25 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Hunting Trap', valueText: '5 gp', weight: 25, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Ink (1 ounce bottle)', valueText: '10 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Ink Pen', valueText: '2 cp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Jug or Pitcher', valueText: '2 cp', weight: 4, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Ladder (10-foot)', valueText: '1 sp', weight: 25, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Lamp', valueText: '5 sp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Lantern, bullseye', valueText: '10 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Lantern, hooded', valueText: '5 gp', weight: 2, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Lock', valueText: '10 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Magnifying Glass', valueText: '100 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Manacles', valueText: '2 gp', weight: 6, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Mess Kit', valueText: '2 sp', weight: 1, itemType: 'Adventuring Gear', category: 'Kit', properties: '' },
  { name: 'Mirror, steel', valueText: '5 gp', weight: 0.5, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Oil (flask)', valueText: '1 sp', weight: 1, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: 'Paper (one sheet)', valueText: '2 sp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Parchment (one sheet)', valueText: '1 sp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Perfume (vial)', valueText: '5 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: "Pick, miner's", valueText: '2 gp', weight: 10, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Piton', valueText: '5 cp', weight: 0.25, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Poison, basic (vial)', valueText: '100 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Consumable', properties: '' },
  { name: 'Pole (10-foot)', valueText: '5 cp', weight: 7, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Pot, iron', valueText: '2 gp', weight: 10, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Potion of Healing', valueText: '50 gp', weight: 0.5, itemType: 'Adventuring Gear', category: 'Consumable', description: 'Regain 2d4+2 hit points when you drink this potion.', properties: '' },
  { name: 'Pouch', valueText: '5 sp', weight: 1, itemType: 'Adventuring Gear', category: 'Bag', properties: '' },
  { name: 'Quiver', valueText: '1 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Auxiliary', properties: '' },
  { name: 'Ram, portable', valueText: '4 gp', weight: 35, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Rations (1 day)', valueText: '5 sp', weight: 2, itemType: 'Adventuring Gear', category: 'Food', properties: '' },
  { name: 'Rope, hempen (50 feet)', valueText: '1 gp', weight: 10, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Rope, silk (50 feet)', valueText: '10 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Sack', valueText: '1 cp', weight: 0.5, itemType: 'Adventuring Gear', category: 'Bag', properties: '' },
  { name: "Scale, merchant's", valueText: '5 gp', weight: 3, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Sealing Wax', valueText: '5 sp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Shovel', valueText: '2 gp', weight: 5, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Signal Whistle', valueText: '5 cp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Signet Ring', valueText: '5 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Jewelry', properties: '' },
  { name: 'Soap', valueText: '2 cp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Spellbook', valueText: '50 gp', weight: 3, itemType: 'Adventuring Gear', category: 'Literature', properties: '' },
  { name: 'Spike, iron', valueText: '1 sp', weight: 5, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Spyglass', valueText: '1,000 gp', weight: 1, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Tent, two-person', valueText: '2 gp', weight: 20, itemType: 'Adventuring Gear', category: 'Camp', properties: '' },
  { name: 'Tinderbox', valueText: '5 sp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Torch', valueText: '1 cp', weight: 1, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Vial', valueText: '1 gp', weight: 0, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Waterskin', valueText: '2 sp', weight: 5, itemType: 'Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Whetstone', valueText: '1 cp', weight: 1, itemType: 'Adventuring Gear', category: 'Tool', properties: '' },

  // ────────────────────────────────────────────────
  // ARCANE FOCUS
  // ────────────────────────────────────────────────
  { name: 'Crystal', valueText: '10 gp', weight: 1, itemType: 'Arcane Focus', category: 'Other', properties: '' },
  { name: 'Orb', valueText: '20 gp', weight: 3, itemType: 'Arcane Focus', category: 'Other', properties: '' },
  { name: 'Rod', valueText: '10 gp', weight: 2, itemType: 'Arcane Focus', category: 'Other', properties: '' },
  { name: 'Staff (Arcane)', valueText: '5 gp', weight: 4, itemType: 'Arcane Focus', category: 'Other', properties: '' },
  { name: 'Wand', valueText: '10 gp', weight: 1, itemType: 'Arcane Focus', category: 'Other', properties: '' },

  // ────────────────────────────────────────────────
  // DRUIDIC FOCUS
  // ────────────────────────────────────────────────
  { name: 'Sprig of Mistletoe', valueText: '1 gp', weight: 0, itemType: 'Druidic Focus', category: 'Other', properties: '' },
  { name: 'Totem', valueText: '1 gp', weight: 0, itemType: 'Druidic Focus', category: 'Other', properties: '' },
  { name: 'Wooden Staff', valueText: '5 gp', weight: 4, itemType: 'Druidic Focus', category: 'Other', properties: '' },
  { name: 'Yew Wand', valueText: '10 gp', weight: 1, itemType: 'Druidic Focus', category: 'Other', properties: '' },

  // ────────────────────────────────────────────────
  // HOLY SYMBOL
  // ────────────────────────────────────────────────
  { name: 'Amulet', valueText: '5 gp', weight: 1, itemType: 'Holy Symbol', category: 'Jewelry', properties: '' },
  { name: 'Emblem', valueText: '5 gp', weight: 0, itemType: 'Holy Symbol', category: 'Other', properties: '' },
  { name: 'Reliquary', valueText: '5 gp', weight: 2, itemType: 'Holy Symbol', category: 'Other', properties: '' },

  // ────────────────────────────────────────────────
  // CLOTHING
  // ────────────────────────────────────────────────
  { name: 'Clothes, common', valueText: '5 sp', weight: 3, itemType: 'Clothing', category: 'Clothing', properties: '' },
  { name: 'Clothes, costume', valueText: '5 gp', weight: 4, itemType: 'Clothing', category: 'Clothing', properties: '' },
  { name: 'Clothes, fine', valueText: '15 gp', weight: 6, itemType: 'Clothing', category: 'Clothing', properties: '' },
  { name: "Clothes, traveler's", valueText: '2 gp', weight: 4, itemType: 'Clothing', category: 'Clothing', properties: '' },
  { name: 'Robe', valueText: '1 gp', weight: 4, itemType: 'Clothing', category: 'Clothing', properties: '' },

  // ────────────────────────────────────────────────
  // ARTISAN'S TOOLS
  // ────────────────────────────────────────────────
  { name: "Alchemist's Supplies", valueText: '50 gp', weight: 8, itemType: "Artisan's Tools", category: 'Kit', properties: '' },
  { name: "Brewer's Supplies", valueText: '20 gp', weight: 9, itemType: "Artisan's Tools", category: 'Kit', properties: '' },
  { name: "Calligrapher's Supplies", valueText: '10 gp', weight: 5, itemType: "Artisan's Tools", category: 'Kit', properties: '' },
  { name: "Carpenter's Tools", valueText: '8 gp', weight: 6, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Cartographer's Tools", valueText: '15 gp', weight: 6, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Cobbler's Tools", valueText: '5 gp', weight: 5, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Cook's Utensils", valueText: '1 gp', weight: 8, itemType: "Artisan's Tools", category: 'Kit', properties: '' },
  { name: "Glassblower's Tools", valueText: '30 gp', weight: 5, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Jeweler's Tools", valueText: '25 gp', weight: 2, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Leatherworker's Tools", valueText: '5 gp', weight: 5, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Mason's Tools", valueText: '10 gp', weight: 8, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Painter's Supplies", valueText: '10 gp', weight: 5, itemType: "Artisan's Tools", category: 'Kit', properties: '' },
  { name: "Potter's Tools", valueText: '10 gp', weight: 3, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Smith's Tools", valueText: '20 gp', weight: 8, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Tinker's Tools", valueText: '50 gp', weight: 10, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Weaver's Tools", valueText: '1 gp', weight: 5, itemType: "Artisan's Tools", category: 'Tool', properties: '' },
  { name: "Woodcarver's Tools", valueText: '1 gp', weight: 5, itemType: "Artisan's Tools", category: 'Tool', properties: '' },

  // ────────────────────────────────────────────────
  // GAMING SETS
  // ────────────────────────────────────────────────
  { name: 'Dice Set', valueText: '1 sp', weight: 0, itemType: 'Gaming Set', category: 'Tool', properties: '' },
  { name: 'Dragonchess Set', valueText: '1 gp', weight: 0.5, itemType: 'Gaming Set', category: 'Tool', properties: '' },
  { name: 'Playing Card Set', valueText: '5 sp', weight: 0, itemType: 'Gaming Set', category: 'Tool', properties: '' },
  { name: 'Three-Dragon Ante Set', valueText: '1 gp', weight: 0, itemType: 'Gaming Set', category: 'Tool', properties: '' },

  // ────────────────────────────────────────────────
  // MUSICAL INSTRUMENTS
  // ────────────────────────────────────────────────
  { name: 'Bagpipes', valueText: '30 gp', weight: 6, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Drum', valueText: '6 gp', weight: 3, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Dulcimer', valueText: '25 gp', weight: 10, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Flute', valueText: '2 gp', weight: 1, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Lute', valueText: '35 gp', weight: 2, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Lyre', valueText: '30 gp', weight: 2, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Horn', valueText: '3 gp', weight: 2, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Pan Flute', valueText: '12 gp', weight: 2, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Shawm', valueText: '2 gp', weight: 1, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },
  { name: 'Viol', valueText: '30 gp', weight: 1, itemType: 'Musical Instrument', category: 'Instrument', properties: '' },

  // ────────────────────────────────────────────────
  // MAGIC ITEMS
  // ────────────────────────────────────────────────
  { name: 'Spell Scroll (Cantrip)', valueText: '25 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Spell Scroll (1st Level)', valueText: '75 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Spell Scroll (2nd Level)', valueText: '150 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Spell Scroll (3rd Level)', valueText: '300 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Spell Scroll (4th Level)', valueText: '500 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Spell Scroll (5th Level)', valueText: '1,000 gp', weight: 0, itemType: 'Magic Item', category: 'Magic Item', properties: '' },
  { name: 'Bag of Holding', valueText: '500 gp', weight: 15, itemType: 'Magic Item', category: 'Bag', description: 'This bag has an interior space considerably larger than its outside dimensions.', requiresAttunement: false, properties: '' },
  { name: 'Bag of Tricks (Gray)', valueText: '400 gp', weight: 0.5, itemType: 'Magic Item', category: 'Magic Item', requiresAttunement: false, properties: '' },
  { name: 'Boots of Elvenkind', valueText: '1,500 gp', weight: 1, itemType: 'Magic Item', category: 'Boots', description: 'Your steps make no sound while you wear these boots.', properties: '' },
  { name: 'Boots of Speed', valueText: '4,000 gp', weight: 1, itemType: 'Magic Item', category: 'Boots', requiresAttunement: true, properties: '' },
  { name: 'Boots of Striding and Springing', valueText: '5,000 gp', weight: 1, itemType: 'Magic Item', category: 'Boots', requiresAttunement: true, properties: '' },
  { name: 'Boots of the Winterlands', valueText: '3,000 gp', weight: 1, itemType: 'Magic Item', category: 'Boots', requiresAttunement: true, properties: '' },
  { name: 'Bracers of Archery', valueText: '1,500 gp', weight: 1, itemType: 'Magic Item', category: 'Greaves', requiresAttunement: true, properties: '' },
  { name: 'Bracers of Defense', valueText: '6,000 gp', weight: 1, acBonus: 2, itemType: 'Magic Item', category: 'Greaves', requiresAttunement: true, properties: '' },
  { name: 'Cloak of Elvenkind', valueText: '5,000 gp', weight: 1, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Cloak of Protection', valueText: '3,500 gp', weight: 1, acBonus: 1, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Cloak of the Manta Ray', valueText: '6,000 gp', weight: 1, itemType: 'Magic Item', category: 'Clothing', properties: '' },
  { name: 'Gauntlets of Ogre Power', valueText: '8,000 gp', weight: 2, itemType: 'Magic Item', category: 'Greaves', requiresAttunement: true, properties: '' },
  { name: 'Goggles of Night', valueText: '1,500 gp', weight: 0, itemType: 'Magic Item', category: 'Helmet', properties: '' },
  { name: 'Headband of Intellect', valueText: '8,000 gp', weight: 0, itemType: 'Magic Item', category: 'Helmet', requiresAttunement: true, properties: '' },
  { name: 'Helm of Brilliance', valueText: '25,000 gp', weight: 3, itemType: 'Magic Item', category: 'Helmet', requiresAttunement: true, properties: '' },
  { name: 'Helm of Telepathy', valueText: '15,000 gp', weight: 3, itemType: 'Magic Item', category: 'Helmet', requiresAttunement: true, properties: '' },
  { name: 'Ioun Stone of Fortitude', valueText: '6,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ioun Stone of Insight', valueText: '8,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ioun Stone of Protection', valueText: '1,200 gp', weight: 0, acBonus: 1, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Necklace of Adaptation', valueText: '1,500 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Necklace of Fireballs', valueText: '16,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', properties: '' },
  { name: 'Ring of Animal Influence', valueText: '4,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', properties: '' },
  { name: 'Ring of Evasion', valueText: '5,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Feather Falling', valueText: '2,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Free Action', valueText: '8,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Invisibility', valueText: '20,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Mind Shielding', valueText: '16,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Protection', valueText: '3,500 gp', weight: 0, acBonus: 1, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Regeneration', valueText: '30,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Resistance', valueText: '6,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Spell Storing', valueText: '24,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Swimming', valueText: '1,500 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', properties: '' },
  { name: 'Ring of Telekinesis', valueText: '36,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Warmth', valueText: '1,000 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', requiresAttunement: true, properties: '' },
  { name: 'Ring of Water Walking', valueText: '1,500 gp', weight: 0, itemType: 'Magic Item', category: 'Jewelry', properties: '' },
  { name: 'Robe of Eyes', valueText: '30,000 gp', weight: 4, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Robe of Scintillating Colors', valueText: '20,000 gp', weight: 4, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Robe of Stars', valueText: '50,000 gp', weight: 4, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Robe of the Archmagi', valueText: '120,000 gp', weight: 4, acBonus: 15, itemType: 'Magic Item', category: 'Clothing', requiresAttunement: true, properties: '' },
  { name: 'Robe of Useful Items', valueText: '5,000 gp', weight: 4, itemType: 'Magic Item', category: 'Clothing', properties: '' },
  { name: "Staff of Fire", valueText: '32,000 gp', weight: 4, damage: '2d6 Fire', itemType: 'Magic Item', category: 'Two-Handed Weapon', requiresAttunement: true, properties: '', maxCharges: 10 },
  { name: "Staff of Frost", valueText: '32,000 gp', weight: 4, damage: '2d6 Cold', itemType: 'Magic Item', category: 'Two-Handed Weapon', requiresAttunement: true, properties: '', maxCharges: 10 },
  { name: "Staff of Healing", valueText: '40,000 gp', weight: 4, itemType: 'Magic Item', category: 'Two-Handed Weapon', requiresAttunement: true, properties: '', maxCharges: 10 },
  { name: "Staff of Power", valueText: '95,500 gp', weight: 4, damage: '1d6+2 Bludgeon', acBonus: 2, itemType: 'Magic Item', category: 'Two-Handed Weapon', requiresAttunement: true, properties: '', maxCharges: 20 },
  { name: "Staff of the Woodlands", valueText: '44,000 gp', weight: 4, damage: '1d6+2 Bludgeon', itemType: 'Magic Item', category: 'Two-Handed Weapon', requiresAttunement: true, properties: '', maxCharges: 10 },
  { name: "Wand of Fireballs", valueText: '23,000 gp', weight: 1, itemType: 'Magic Item', category: 'Other', requiresAttunement: true, properties: '', maxCharges: 7 },
  { name: "Wand of Lightning Bolts", valueText: '23,000 gp', weight: 1, itemType: 'Magic Item', category: 'Other', requiresAttunement: true, properties: '', maxCharges: 7 },
  { name: "Wand of Magic Missiles", valueText: '9,000 gp', weight: 1, itemType: 'Magic Item', category: 'Other', properties: '', maxCharges: 7 },
  { name: "Wand of the War Mage +1", valueText: '6,000 gp', weight: 1, itemType: 'Magic Item', category: 'Other', requiresAttunement: true, properties: '' },
  { name: "Wand of Web", valueText: '12,000 gp', weight: 1, itemType: 'Magic Item', category: 'Other', requiresAttunement: true, properties: '', maxCharges: 7 },

  // ────────────────────────────────────────────────
  // COMMON ADVENTURING GEAR (HOMEBREW)
  // ────────────────────────────────────────────────
  { name: 'Patchwork Satchel', valueText: '3 sp', weight: 1, itemType: 'Common Adventuring Gear', category: 'Bag', description: 'A well-worn leather satchel with mismatched patches.', properties: '' },
  { name: 'Compass', valueText: '10 gp', weight: 0.5, itemType: 'Common Adventuring Gear', category: 'Tool', description: 'A magnetic compass for navigation.', properties: '' },
  { name: 'Sewing Kit', valueText: '1 gp', weight: 0.5, itemType: 'Common Adventuring Gear', category: 'Kit', description: 'Needles, thread, and a small pair of scissors.', properties: '' },
  { name: 'Bone Dice (set)', valueText: '2 sp', weight: 0, itemType: 'Common Adventuring Gear', category: 'Tool', properties: '' },
  { name: 'Chalk (10 pieces)', valueText: '1 cp', weight: 0, itemType: 'Common Adventuring Gear', category: 'Other', properties: '' },
  { name: 'Field Journal', valueText: '5 sp', weight: 1, itemType: 'Common Adventuring Gear', category: 'Literature', description: 'A blank journal for recording notes, maps, and observations.', properties: '' },
  { name: 'Firestarter Kit', valueText: '3 sp', weight: 0.5, itemType: 'Common Adventuring Gear', category: 'Kit', description: 'Flint, steel, and tinder in a small leather pouch.', properties: '' },
  { name: 'Salve of Wound Sealing', valueText: '5 gp', weight: 0, itemType: 'Common Adventuring Gear', category: 'Consumable', description: 'A herbal salve that stops bleeding and prevents infection.', properties: '' },
  { name: 'Trail Mix (7 days)', valueText: '2 sp', weight: 3, itemType: 'Common Adventuring Gear', category: 'Food', description: 'Dried fruit, nuts, and jerky.', properties: '' },
  { name: 'Waterproof Sack', valueText: '4 sp', weight: 0.5, itemType: 'Common Adventuring Gear', category: 'Bag', description: 'A waxed canvas sack that keeps contents dry.', properties: '' },
  { name: 'Codebook', valueText: '8 gp', weight: 1, itemType: 'Common Adventuring Gear', category: 'Literature', description: 'A cipher book for writing and reading coded messages.', properties: '' },
  { name: 'Disguise Kit', valueText: '25 gp', weight: 3, itemType: 'Common Adventuring Gear', category: 'Kit', properties: '' },
  { name: "Forgery Kit", valueText: '15 gp', weight: 5, itemType: 'Common Adventuring Gear', category: 'Kit', properties: '' },
  { name: "Herbalism Kit", valueText: '5 gp', weight: 3, itemType: 'Common Adventuring Gear', category: 'Kit', properties: '' },
  { name: "Navigator's Tools", valueText: '25 gp', weight: 2, itemType: 'Common Adventuring Gear', category: 'Tool', properties: '' },
  { name: "Poisoner's Kit", valueText: '50 gp', weight: 2, itemType: 'Common Adventuring Gear', category: 'Kit', properties: '' },
  { name: "Thieves' Tools", valueText: '25 gp', weight: 1, itemType: 'Common Adventuring Gear', category: 'Tool', properties: '' },

  // ────────────────────────────────────────────────
  // ALCOHOLIC BEVERAGES (HOMEBREW)
  // ────────────────────────────────────────────────
  { name: 'Common Ale (mug)', valueText: '4 cp', weight: 1, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A frothy mug of everyday ale.', properties: '' },
  { name: 'Fine Wine (bottle)', valueText: '10 gp', weight: 2, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A bottle of quality wine from a notable vineyard.', properties: '' },
  { name: 'Dwarven Spirits (flask)', valueText: '2 gp', weight: 1, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A potent distilled spirit favored by dwarven miners.', properties: '' },
  { name: 'Elven Moonwine (vial)', valueText: '5 gp', weight: 0.5, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A delicate sparkling wine brewed under moonlight.', properties: '' },
  { name: "Halfling's Honey Mead (bottle)", valueText: '3 gp', weight: 2, itemType: 'Alcoholic Beverage', category: 'Food', description: 'Sweet mead brewed with clover honey and wildflowers.', properties: '' },
  { name: 'Goblin Rotgut (flask)', valueText: '2 cp', weight: 1, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A vile concoction that burns going down. Effects may be unpredictable.', properties: '' },
  { name: 'Dragon Fire Whiskey (shot)', valueText: '5 sp', weight: 0.5, itemType: 'Alcoholic Beverage', category: 'Food', description: 'Aged whiskey with a fiery finish.', properties: '' },
  { name: 'Coastal Rum (bottle)', valueText: '1 gp', weight: 2, itemType: 'Alcoholic Beverage', category: 'Food', description: 'Dark rum from the southern coast.', properties: '' },
  { name: 'Herbal Brandy (vial)', valueText: '3 gp', weight: 0.5, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A warming brandy infused with mountain herbs.', properties: '' },
  { name: "Witch's Brew (vial)", valueText: '8 gp', weight: 0.5, itemType: 'Alcoholic Beverage', category: 'Food', description: 'A mysterious purple liquor said to have minor magical properties.', properties: '' },

  // ────────────────────────────────────────────────
  // HOMEBREW WEAPONS
  // ────────────────────────────────────────────────
  { name: 'Hook Dagger', valueText: '5 gp', damage: '1d4 Piercing', weight: 2, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light, can disarm on hit' },
  { name: 'Grave Cleaver', valueText: '20 gp', damage: '1d10 Slashing', weight: 8, itemType: 'Homebrew Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Necrotic on crit' },
  { name: 'Barbed Glaive', valueText: '30 gp', damage: '1d10 Slashing', weight: 7, itemType: 'Homebrew Melee Weapons', category: 'Two-Handed Weapon', properties: 'Heavy, Reach, Bleeding on crit' },
  { name: 'Chain Whip', valueText: '10 gp', damage: '1d6 Bludgeon', weight: 4, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Reach, can grapple target' },
  { name: 'Serrated Shortsword', valueText: '15 gp', damage: '1d6 Slashing', weight: 2, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light, Bleeding (1d4 persistent)' },
  { name: 'Bone Sword', valueText: '12 gp', damage: '1d8 Piercing', weight: 3, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Lightweight, Brittle (DC 12 save on crit)' },
  { name: 'Twin-Fanged Axe', valueText: '25 gp', damage: '1d8 Slashing', weight: 5, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Two attacks if used in two-weapon fighting' },
  { name: 'Obsidian Dagger', valueText: '8 gp', damage: '1d4 Piercing', weight: 1, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Light, Ignore natural armor' },
  { name: 'War Scythe', valueText: '20 gp', damage: '1d10 Slashing', weight: 8, itemType: 'Homebrew Melee Weapons', category: 'Two-Handed Weapon', properties: 'Reach, Heavy, Sweep attack (bonus action)' },
  { name: 'Sand Blade', valueText: '18 gp', damage: '1d6 Slashing', weight: 2, itemType: 'Homebrew Melee Weapons', category: 'One-Handed Weapon', properties: 'Finesse, Blind on crit (DC 12 Con)' },

  // ────────────────────────────────────────────────
  // HOMEBREW SHIELDS
  // ────────────────────────────────────────────────
  { name: 'Reinforced Tower Shield', valueText: '30 gp', acBonus: 3, weight: 15, itemType: 'Homebrew Shield', category: 'Shield', properties: 'Heavy, -5 ft speed, Full Cover (action)' },
  { name: 'Sickle Shield', valueText: '20 gp', acBonus: 2, damage: '1d4 Slashing', weight: 5, itemType: 'Homebrew Shield', category: 'Shield', properties: 'Shield bash deals 1d4 slashing' },
  { name: 'Buckler', valueText: '7 gp', acBonus: 1, weight: 2, itemType: 'Homebrew Shield', category: 'Shield', properties: 'Light, can use with finesse weapons' },
  { name: 'Spike Shield', valueText: '15 gp', acBonus: 2, damage: '1d4 Piercing', weight: 7, itemType: 'Homebrew Shield', category: 'Shield', properties: 'Deals 1d4 piercing on successful shove' },
  { name: 'Wicker Shield', valueText: '4 gp', acBonus: 1, weight: 2, itemType: 'Homebrew Shield', category: 'Shield', properties: 'Flammable, Light' },

  // ────────────────────────────────────────────────
  // HOMEBREW ARMOR
  // ────────────────────────────────────────────────
  { name: 'Woven Reed Jerkin', valueText: '6 gp', acBonus: 11, weight: 6, itemType: 'Homebrew Light Armor', category: 'Light Armor', properties: 'Flammable, Aquatic adaptation' },
  { name: 'Chain-Ribbon Hauberk', valueText: '120 gp', acBonus: 14, weight: 18, itemType: 'Homebrew Medium Armor', category: 'Medium Armor', properties: 'Glittering (disadvantage on Stealth)' },
  { name: 'Bone Plate Cuirass', valueText: '80 gp', acBonus: 14, weight: 25, itemType: 'Homebrew Heavy Armor', category: 'Heavy Armor', properties: 'Intimidating, Disadvantage on Stealth' },
  { name: 'Shadowweave Cloak-Armor', valueText: '200 gp', acBonus: 12, weight: 8, itemType: 'Homebrew Light Armor', category: 'Light Armor', properties: 'Advantage on Stealth in dim light/darkness' },
  { name: 'Ironbark Vest', valueText: '75 gp', acBonus: 13, weight: 14, itemType: 'Homebrew Medium Armor', category: 'Medium Armor', properties: 'Resistance to piercing from ranged attacks' },
  { name: 'Magma-Forged Plate', valueText: '2,000 gp', acBonus: 17, weight: 60, itemType: 'Homebrew Heavy Armor', category: 'Heavy Armor', properties: 'Disadvantage on Stealth - Strength 15 - Resistance to fire', requiresAttunement: true },
  { name: 'Tundra Furs', valueText: '35 gp', acBonus: 12, weight: 10, itemType: 'Homebrew Light Armor', category: 'Light Armor', properties: 'Advantage on saves vs. cold environments' },

  // ────────────────────────────────────────────────
  // HOMEBREW CLOTHING
  // ────────────────────────────────────────────────
  { name: 'Sand-Warden Wraps', valueText: '4 gp', weight: 1, itemType: 'Homebrew Clothing', category: 'Clothing', description: 'Linen wrappings that protect from heat and sand.', properties: '' },
  { name: 'Frost-Lined Cloak', valueText: '18 gp', weight: 3, itemType: 'Homebrew Clothing', category: 'Clothing', description: 'A cloak with frost-lichen lining that keeps the wearer warm.', properties: '' },
  { name: 'Shadowsilk Cowl', valueText: '45 gp', weight: 1, itemType: 'Homebrew Clothing', category: 'Clothing', description: 'A hood woven from shadowsilk that muffles sound.', properties: '' },
  { name: 'Merchant Finery', valueText: '12 gp', weight: 4, itemType: 'Homebrew Clothing', category: 'Clothing', description: 'Well-made clothes that suggest wealth and status.', properties: '' },
  { name: 'Ranger Leathers', valueText: '8 gp', weight: 3, itemType: 'Homebrew Clothing', category: 'Clothing', description: 'Practical brown and green clothing for woodland travel.', properties: '' },
  { name: 'Gladiator Sandals', valueText: '3 gp', weight: 1, itemType: 'Homebrew Clothing', category: 'Boots', description: 'Strapped sandals favored by arena fighters.', properties: '' },
  { name: 'Iron-Toed Boots', valueText: '7 gp', weight: 3, itemType: 'Homebrew Clothing', category: 'Boots', description: 'Sturdy boots with reinforced toes.', properties: '' },

  // ────────────────────────────────────────────────
  // MECHANICAL JEWELRY (HOMEBREW)
  // ────────────────────────────────────────────────
  { name: 'Blood-Marker Ring', valueText: '15 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A ring with a hidden sharp thorn. Can mark a target with a blood scent.', properties: '' },
  { name: "Navigator's Earring", valueText: '20 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A lodestone earring that always points toward the last place you slept.', properties: '' },
  { name: "Merchant's Scale Bracelet", valueText: '30 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A bracelet that vibrates when someone nearby is lying about prices.', properties: '' },
  { name: 'Thief-Proof Clasp', valueText: '8 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A neck clasp that retracts and alerts the wearer when removed without a key.', properties: '' },
  { name: 'Hourglass Pendant', valueText: '12 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A pendant hourglass that counts exactly 1 minute. Can be reset.', properties: '' },
  { name: 'Signal Brooch', valueText: '25 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Jewelry', description: 'A brooch that can emit a coded signal visible up to 100 feet away.', properties: '' },
  { name: 'Clockwork Monocle', valueText: '40 gp', weight: 0, itemType: 'Mechanical Jewelry', category: 'Helmet', description: 'A mechanical monocle with adjustable lenses for magnification.', properties: '' },

  // ────────────────────────────────────────────────
  // HOMEBREW BOWS
  // ────────────────────────────────────────────────
  { name: 'Recurve Hunting Bow', valueText: '35 gp', damage: '1d6 Piercing', weight: 2, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (100/400), Two-Handed' },
  { name: 'Ridgeback Longbow', valueText: '65 gp', damage: '1d8 Piercing', weight: 3, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (150/600), Heavy, Two-Handed, +1d4 on stationary attack' },
  { name: 'Compact Short Bow', valueText: '20 gp', damage: '1d6 Piercing', weight: 1.5, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (60/240), Two-Handed, Light (can use on horseback)' },
  { name: 'Siege Crossbow', valueText: '120 gp', damage: '2d8 Piercing', weight: 20, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (60/180), Heavy, Loading, Two-Handed, ignores cover' },
  { name: 'War Bow', valueText: '80 gp', damage: '1d10 Piercing', weight: 4, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (150/600), Heavy, Two-Handed, Strength 14 required' },
  { name: 'Shadow Shortbow', valueText: '90 gp', damage: '1d6 Piercing', weight: 1.5, itemType: 'Homebrew Bow', category: 'Two-Handed Weapon', properties: 'Ammunition (80/320), Two-Handed, silent shot (no sound)' },

  // ────────────────────────────────────────────────
  // HOMEBREW ARROWS
  // ────────────────────────────────────────────────
  { name: 'Broadhead Arrow', valueText: '2 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: '+1d4 bleed on hit' },
  { name: 'Needlepoint Arrow', valueText: '3 sp', weight: 0.05, itemType: 'Homebrew Arrows', category: 'Ammo', properties: 'Ignores non-magical light armor' },
  { name: 'Blunt Arrow', valueText: '1 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: 'Deals bludgeoning (non-lethal), deals 1d4' },
  { name: 'Fire Arrow', valueText: '5 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: '+1d4 fire damage' },
  { name: 'Ice Arrow', valueText: '5 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: '+1d4 cold damage, DC 12 save vs. slow' },
  { name: 'Explosive Arrow', valueText: '2 gp', weight: 0.2, itemType: 'Homebrew Arrows', category: 'Ammo', properties: '5ft blast on impact, 1d6 fire, DC 13 Dex save' },
  { name: 'Rope Arrow', valueText: '1 gp', weight: 0.5, itemType: 'Homebrew Arrows', category: 'Ammo', properties: 'Attaches 30 ft rope to target surface' },
  { name: 'Signal Arrow', valueText: '3 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: 'Emits bright colored light and whistle sound on impact' },
  { name: 'Hunting Arrow', valueText: '1 sp', weight: 0.1, itemType: 'Homebrew Arrows', category: 'Ammo', properties: '+1d4 vs. beasts and monstrosities' },
  { name: 'Armor-Piercing Bolt', valueText: '4 sp', weight: 0.15, itemType: 'Homebrew Arrows', category: 'Ammo', properties: 'Ignores first 3 points of AC bonus from armor' },

  // ────────────────────────────────────────────────
  // ANIMAL AUXILIARY BAGS
  // ────────────────────────────────────────────────
  { name: 'Saddlebag (Animal)', valueText: '4 gp', weight: 2, unitCapacity: 30, itemType: 'Animal Auxiliary', category: 'Animal Auxiliary', properties: 'Straps to a medium or large animal companion. Carries up to 30 units.' },
  { name: 'Pannier Basket', valueText: '2 gp', weight: 1, unitCapacity: 15, itemType: 'Animal Auxiliary', category: 'Animal Auxiliary', properties: 'Lightweight wicker baskets for a medium or large animal companion. Carries up to 15 units.' },
  { name: 'Pack Frame (Animal)', valueText: '6 gp', weight: 3, unitCapacity: 50, itemType: 'Animal Auxiliary', category: 'Animal Auxiliary', properties: 'Reinforced frame pack for large animal companions. Carries up to 50 units.' },
  { name: 'Cargo Bags (Large)', valueText: '10 gp', weight: 5, unitCapacity: 80, itemType: 'Animal Auxiliary', category: 'Animal Auxiliary', properties: 'Heavy-duty bags for large animal companions such as horses. Carries up to 80 units.' },
];

export const ITEM_REPOSITORY_TYPES: string[] = Array.from(
  new Set(ITEM_REPOSITORY.map((e) => e.itemType))
);
