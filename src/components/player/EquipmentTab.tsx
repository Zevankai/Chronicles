import React, { useState } from 'react';
import { PlayerData, Item, ItemCategory, EquipmentSlot } from '../../types';
import { CoinDisplay } from '../common/CoinDisplay';
import { ItemRepositorySearch } from '../common/ItemRepositorySearch';
import { ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES } from '../../constants';
import { getInventoryWeight, getEncumbranceStatus, getCombatEncumberedThreshold, getOverEncumberedThreshold, getPlayerCapacity, generateId, getModifier, parseBodyWeight } from '../../utils';

interface EquipmentTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

const EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'Bag', label: 'Bag', icon: '🎒' },
  { slot: 'Auxiliary1', label: 'Aux 1', icon: '🏷' },
  { slot: 'Auxiliary2', label: 'Aux 2', icon: '🏷' },
  { slot: 'PrimaryHand', label: 'Primary Hand', icon: '⚔️' },
  { slot: 'SecondaryHand', label: 'Secondary Hand', icon: '🛡' },
  { slot: 'HeadArmor', label: 'Head Armor', icon: '⛑' },
  { slot: 'PrimaryArmor', label: 'Body Armor', icon: '🥋' },
  { slot: 'Gauntlets', label: 'Gauntlets', icon: '🧤' },
  { slot: 'Boots', label: 'Boots', icon: '👢' },
  { slot: 'Jewelry1', label: 'Jewelry 1', icon: '💍' },
  { slot: 'Jewelry2', label: 'Jewelry 2', icon: '💍' },
  { slot: 'Jewelry3', label: 'Jewelry 3', icon: '💍' },
  { slot: 'Clothing1', label: 'Clothing 1', icon: '👘' },
  { slot: 'Clothing2', label: 'Clothing 2', icon: '👘' },
  { slot: 'Misc', label: 'Misc', icon: '🔮' },
];

// Maps item categories to their valid equipment slots
const CATEGORY_TO_SLOTS: Partial<Record<ItemCategory, EquipmentSlot[]>> = {
  'Bag': ['Bag'],
  'Auxiliary': ['Auxiliary1', 'Auxiliary2'],
  'One-Handed Weapon': ['PrimaryHand', 'SecondaryHand'],
  'Two-Handed Weapon': ['PrimaryHand'],
  'Shield': ['SecondaryHand'],
  'Helmet': ['HeadArmor'],
  'Light Armor': ['PrimaryArmor'],
  'Medium Armor': ['PrimaryArmor'],
  'Heavy Armor': ['PrimaryArmor'],
  'Greaves': ['Gauntlets'],
  'Boots': ['Boots'],
  'Jewelry': ['Jewelry1', 'Jewelry2', 'Jewelry3'],
  'Clothing': ['Clothing1', 'Clothing2'],
};

// Only 'Other' category items can be equipped to Misc
function getAvailableSlots(item: Item): EquipmentSlot[] {
  const specific = CATEGORY_TO_SLOTS[item.category] || [];
  if (item.category === 'Other') {
    return [...specific, 'Misc'];
  }
  return specific;
}

function getItemWeight(item: Item): number {
  return item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
}

function getCoinWeight(coins: { cp: number; sp: number; gp: number; pp: number }): number {
  return (coins.cp + coins.sp + coins.gp + coins.pp) * 0.01;
}

function ItemEditForm({
  item,
  onChange,
  onClose,
}: {
  item: Item;
  onChange: (updated: Item) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...item });

  const update = <K extends keyof Item>(key: K, value: Item[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const isWeapon = ['One-Handed Weapon', 'Two-Handed Weapon'].includes(draft.category);
  const isArmor = ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Helmet', 'Greaves', 'Boots'].includes(draft.category);
  const isShield = draft.category === 'Shield';
  const isBag = draft.category === 'Bag';
  const isAux = draft.category === 'Auxiliary';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit Item</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label className="field-label">Name</label>
              <input type="text" value={draft.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select value={draft.category} onChange={(e) => update('category', e.target.value as ItemCategory)}>
                {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input type="number" value={draft.quantity} min={0} onChange={(e) => update('quantity', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="field-label">Weight (units)</label>
              <input type="number" value={draft.weight ?? ''} placeholder="Default" min={0} step={0.1}
                onChange={(e) => update('weight', e.target.value ? parseFloat(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="field-label">Value (CP)</label>
              <input type="number" value={draft.value ?? ''} placeholder="0" min={0}
                onChange={(e) => update('value', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea value={draft.description || ''} onChange={(e) => update('description', e.target.value)} rows={2} placeholder="Item description..." />
          </div>

          {/* Weapon fields */}
          {(isWeapon || isShield) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <label className="field-label">Damage</label>
                <input type="text" value={draft.damage || ''} placeholder="e.g. 1d8" onChange={(e) => update('damage', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Hit Modifier</label>
                <input type="number" value={draft.hitModifier ?? ''} placeholder="0" onChange={(e) => update('hitModifier', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="field-label">Damage Modifier</label>
                <input type="number" value={draft.damageModifier ?? ''} placeholder="0" onChange={(e) => update('damageModifier', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
            </div>
          )}

          {/* Armor fields */}
          {(isArmor || isShield) && (
            <div>
              <label className="field-label">AC Bonus</label>
              <input type="number" value={draft.acBonus ?? ''} placeholder="0" min={0}
                onChange={(e) => update('acBonus', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          )}

          {/* Bag capacity */}
          {isBag && (
            <div>
              <label className="field-label">Unit Capacity</label>
              <input type="number" value={draft.unitCapacity ?? ''} placeholder="15" min={1}
                onChange={(e) => update('unitCapacity', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          )}

          {/* Auxiliary bag */}
          {isAux && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <label className="field-label">Item Capacity</label>
                <input type="number" value={draft.itemMaxCapacity ?? ''} placeholder="20" min={1}
                  onChange={(e) => update('itemMaxCapacity', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="field-label">Unit Capacity</label>
                <input type="number" value={draft.unitCapacity ?? ''} placeholder="—" min={1}
                  onChange={(e) => update('unitCapacity', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Allowed Item Types (empty = all)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 120, overflowY: 'auto', border: '1px solid var(--color-border-light)', borderRadius: 4, padding: 4 }}>
                  {ITEM_CATEGORIES.map((cat) => {
                    const checked = (draft.allowedItemTypes || []).includes(cat);
                    return (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = draft.allowedItemTypes || [];
                            update('allowedItemTypes', e.target.checked
                              ? [...current, cat]
                              : current.filter((c) => c !== cat));
                          }}
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Attunement & charges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={!!draft.requiresAttunement} onChange={(e) => update('requiresAttunement', e.target.checked)} />
              Requires Attunement
            </label>
            {draft.requiresAttunement && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
                <input type="checkbox" checked={!!draft.attuned} onChange={(e) => update('attuned', e.target.checked)} />
                Attuned
              </label>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label className="field-label">Max Charges</label>
              <input type="number" value={draft.maxCharges ?? ''} placeholder="—" min={0}
                onChange={(e) => update('maxCharges', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="field-label">Current Charges</label>
              <input type="number" value={draft.currentCharges ?? ''} placeholder="—" min={0}
                max={draft.maxCharges}
                onChange={(e) => update('currentCharges', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          </div>

          <div>
            <label className="field-label">Properties / Notes</label>
            <textarea value={draft.properties || ''} onChange={(e) => update('properties', e.target.value)} rows={2} placeholder="Item properties and notes..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onChange(draft); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function EquipSlotPicker({
  item,
  availableSlots,
  inventory,
  onEquip,
  onClose,
}: {
  item: Item;
  availableSlots: EquipmentSlot[];
  inventory: Item[];
  onEquip: (slot: EquipmentSlot | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 280 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Equip: {item.name}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {availableSlots.map((slot) => {
            const occupant = inventory.find((i) => i.id !== item.id && i.equipped === slot);
            const slotInfo = EQUIPMENT_SLOTS.find((s) => s.slot === slot);
            return (
              <button
                key={slot}
                className="btn btn-secondary"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => { onEquip(slot); onClose(); }}
              >
                <span>{slotInfo?.icon} {slotInfo?.label}</span>
                {occupant ? (
                  <span style={{ fontSize: 10, color: 'var(--color-warning)' }}>({occupant.name})</span>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--color-success)' }}>Empty</span>
                )}
              </button>
            );
          })}
          {item.equipped && (
            <button className="btn btn-danger btn-sm" onClick={() => { onEquip(null); onClose(); }}>
              Unequip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, disabled }: { onAdd: (item: Item) => void; disabled?: boolean }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Other');
  const [qty, setQty] = useState(1);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: generateId(),
      name: name.trim(),
      category,
      quantity: qty,
      equipped: null,
    });
    setName('');
    setQty(1);
  };

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '6px 0' }}>
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        style={{ flex: 1, minWidth: 80 }}
        disabled={disabled}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ItemCategory)}
        style={{ flex: 1, minWidth: 80 }}
        disabled={disabled}
      >
        {ITEM_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        type="number"
        value={qty}
        min={1}
        onChange={(e) => setQty(parseInt(e.target.value) || 1)}
        style={{ width: 45 }}
        disabled={disabled}
      />
      <button className="btn btn-primary btn-sm" onClick={submit} disabled={disabled}>Add</button>
    </div>
  );
}

export function EquipmentTab({ player, onChange, canEdit }: EquipmentTabProps) {
  const [subTab, setSubTab] = useState<'slots' | 'bag' | 'quick'>('slots');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [equipPickerItem, setEquipPickerItem] = useState<Item | null>(null);
  const [overCapacityWarning, setOverCapacityWarning] = useState(false);
  const [auxPickerItem, setAuxPickerItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  const totalWeight = getInventoryWeight(player.inventory, player.coins, player.bagDropped);
  const strMod = getModifier(player.attributes.STR);
  const bodyWeight = parseBodyWeight(player);
  const combatThreshold = getCombatEncumberedThreshold(bodyWeight, strMod);
  const overThreshold = getOverEncumberedThreshold(bodyWeight, strMod);
  const enc = getEncumbranceStatus(player);
  const isOverEncumbered = enc === 'over';
  const bagCapacity = getPlayerCapacity(player);

  const hasAuxEquipped = player.inventory.some((i) =>
    i.equipped === 'Auxiliary1' || i.equipped === 'Auxiliary2'
  );

  const equippedBag = player.inventory.find((i) => i.equipped === 'Bag' && i.category === 'Bag');

  const removeItem = (id: string) => {
    onChange({ ...player, inventory: player.inventory.filter((i) => i.id !== id) });
  };

  const updateItem = (updated: Item) => {
    onChange({ ...player, inventory: player.inventory.map((i) => i.id === updated.id ? updated : i) });
  };

  const updateQty = (id: string, qty: number) => {
    onChange({
      ...player,
      inventory: player.inventory.map((i) => i.id === id ? { ...i, quantity: qty } : i),
    });
  };

  const toggleEquip = (item: Item, slot: EquipmentSlot) => {
    const newEquipped = item.equipped === slot ? null : slot;
    let newInventory = player.inventory.map((i) => i.id === item.id ? { ...i, equipped: newEquipped } : i);

    // Two-handed weapon: also unequip anything in SecondaryHand
    if (item.category === 'Two-Handed Weapon') {
      if (newEquipped === 'PrimaryHand') {
        // Unequip whatever is in SecondaryHand
        newInventory = newInventory.map((i) =>
          i.id !== item.id && i.equipped === 'SecondaryHand' ? { ...i, equipped: null } : i
        );
      }
    }

    // Check for over-capacity after unequipping a bag
    const updatedPlayer = { ...player, inventory: newInventory };
    if (item.category === 'Bag' && newEquipped === null) {
      const newCapacity = getPlayerCapacity(updatedPlayer);
      const newWeight = getInventoryWeight(updatedPlayer.inventory, updatedPlayer.coins);
      if (newWeight > newCapacity) {
        setOverCapacityWarning(true);
      }
    }

    onChange(updatedPlayer);
  };

  const equipItem = (item: Item, slot: EquipmentSlot | null) => {
    let newInventory = player.inventory.map((i) => i.id === item.id ? { ...i, equipped: slot } : i);

    // Two-handed weapon: auto-unequip SecondaryHand
    if (item.category === 'Two-Handed Weapon' && slot === 'PrimaryHand') {
      newInventory = newInventory.map((i) =>
        i.id !== item.id && i.equipped === 'SecondaryHand' ? { ...i, equipped: null } : i
      );
    }

    // Check for over-capacity after unequipping a bag
    const updatedPlayer = { ...player, inventory: newInventory };
    if (item.category === 'Bag' && slot === null) {
      const newCapacity = getPlayerCapacity(updatedPlayer);
      const newWeight = getInventoryWeight(updatedPlayer.inventory, updatedPlayer.coins);
      if (newWeight > newCapacity) {
        setOverCapacityWarning(true);
      }
    }

    onChange(updatedPlayer);
  };

  const addItem = (item: Item) => {
    // Check bag capacity before adding
    const newWeight = totalWeight + getItemWeight(item) * item.quantity;
    if (newWeight > bagCapacity) {
      alert(`Cannot add item: bag is full (${totalWeight.toFixed(1)}/${bagCapacity} units). Equip a larger bag or remove items.`);
      return;
    }
    onChange({ ...player, inventory: [...player.inventory, item] });
  };

  // Transfer item from bag inventory to an auxiliary slot
  const transferToAux = (item: Item, auxSlot: 'Auxiliary1' | 'Auxiliary2') => {
    const auxItem = player.inventory.find((i) => i.equipped === auxSlot && i.category === 'Auxiliary');
    if (!auxItem) {
      alert(`No auxiliary equipped in ${auxSlot}.`);
      return;
    }
    // Check allowed item types
    if (auxItem.allowedItemTypes && auxItem.allowedItemTypes.length > 0) {
      if (!auxItem.allowedItemTypes.includes(item.category)) {
        alert(`This auxiliary only accepts: ${auxItem.allowedItemTypes.join(', ')}`);
        return;
      }
    }
    // Check item capacity
    const currentAuxItems = player.inventory.filter((i) => i.equipped === auxSlot && i.id !== auxItem.id);
    if (auxItem.itemMaxCapacity != null && currentAuxItems.length >= auxItem.itemMaxCapacity) {
      alert(`Auxiliary is full (${currentAuxItems.length}/${auxItem.itemMaxCapacity} items).`);
      return;
    }
    onChange({
      ...player,
      inventory: player.inventory.map((i) => i.id === item.id ? { ...i, equipped: auxSlot } : i),
    });
    setAuxPickerItem(null);
  };

  // Transfer item from auxiliary back to main bag
  const transferToBag = (item: Item) => {
    const newWeight = totalWeight + getItemWeight(item) * item.quantity;
    if (newWeight > bagCapacity) {
      alert(`Cannot transfer: bag is full (${totalWeight.toFixed(1)}/${bagCapacity} units).`);
      return;
    }
    onChange({
      ...player,
      inventory: player.inventory.map((i) => i.id === item.id ? { ...i, equipped: null } : i),
    });
  };

  // Bag inventory = items with no equipment slot (equipped items move to slots only)
  const bagItems = player.inventory.filter((i) => !i.equipped);
  // Quick inventory = items in aux slots
  const quickItems = player.inventory.filter((i) => i.equipped && ['Auxiliary1', 'Auxiliary2'].includes(i.equipped));

  const equippedAuxSlots = (['Auxiliary1', 'Auxiliary2'] as const).filter((slot) =>
    player.inventory.some((i) => i.equipped === slot && i.category === 'Auxiliary')
  );

  // Check if a two-handed weapon is currently equipped in PrimaryHand
  const twoHandedInPrimary = player.inventory.find(
    (i) => i.category === 'Two-Handed Weapon' && i.equipped === 'PrimaryHand'
  );

  const renderInventoryList = (items: Item[], showEquipBtn = false, isAuxView = false) => (
    <div>
      {items.map((item) => {
        const unitWeight = getItemWeight(item);
        const isExpanded = expandedItemId === item.id;
        // Filter SecondaryHand from available slots when a 2H weapon is in PrimaryHand
        // (unless this item IS the 2H weapon itself)
        const validSlots = getAvailableSlots(item).filter((slot) => {
          if (slot === 'SecondaryHand' && twoHandedInPrimary && item.id !== twoHandedInPrimary.id) {
            return false;
          }
          return true;
        });

        return (
          <div key={item.id} style={{ marginBottom: 4 }}>
            <div className="inventory-row" style={{ gridTemplateColumns: '1fr 55px 36px auto' }}>
              <button
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: 0, fontSize: 12, color: 'var(--color-text)'
                }}
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
              >
                {item.name}
                {item.equipped && (
                  <span className="badge badge-info" style={{ marginLeft: 4, fontSize: 9 }}>
                    {item.equipped}
                  </span>
                )}
                {item.requiresAttunement && (
                  <span className="badge badge-warning" style={{ marginLeft: 4, fontSize: 9 }}>
                    {item.attuned ? '✦' : '◇'} Attune
                  </span>
                )}
              </button>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                {item.category}<br />{(unitWeight * item.quantity).toFixed(1)}u
              </span>
              {canEdit ? (
                <input
                  type="number"
                  value={item.quantity}
                  min={0}
                  onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0)}
                  style={{ width: 35, padding: '1px 2px', fontSize: 11 }}
                />
              ) : (
                <span style={{ fontSize: 12, textAlign: 'center' }}>×{item.quantity}</span>
              )}
              {canEdit && (
                <div style={{ display: 'flex', gap: 1 }}>
                  {showEquipBtn && validSlots.length > 0 && (
                    <button
                      className={`btn-icon${item.equipped ? ' active' : ''}`}
                      onClick={() => setEquipPickerItem(item)}
                      title={item.equipped ? `Equipped: ${item.equipped}` : 'Equip'}
                      style={{ fontSize: 11, color: item.equipped ? 'var(--color-primary)' : undefined }}
                    >
                      {item.equipped ? '✅' : '⚔️'}
                    </button>
                  )}
                  {!isAuxView && equippedAuxSlots.length > 0 && (
                    <button
                      className="btn-icon"
                      onClick={() => {
                        if (equippedAuxSlots.length === 1) {
                          transferToAux(item, equippedAuxSlots[0]);
                        } else {
                          setAuxPickerItem(item);
                        }
                      }}
                      title="Transfer to Auxiliary"
                      style={{ fontSize: 11 }}
                    >
                      ⚡
                    </button>
                  )}
                  {isAuxView && (
                    <button
                      className="btn-icon"
                      onClick={() => transferToBag(item)}
                      title="Transfer to Bag"
                      style={{ fontSize: 11 }}
                    >
                      🎒
                    </button>
                  )}
                  <button className="btn-icon" onClick={() => setEditingItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => removeItem(item.id)} title="Remove">🗑</button>
                </div>
              )}
            </div>
            {/* Expanded item details */}
            {isExpanded && (
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 4,
                padding: '6px 8px',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                marginTop: 2,
              }}>
                {item.description && <div style={{ marginBottom: 4, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{item.description}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {item.value !== undefined && <div><strong>Value:</strong> {item.value} cp</div>}
                  {item.damage && <div><strong>Damage:</strong> {item.damage}</div>}
                  {item.hitModifier !== undefined && <div><strong>Hit Mod:</strong> {item.hitModifier >= 0 ? '+' : ''}{item.hitModifier}</div>}
                  {item.damageModifier !== undefined && <div><strong>Dmg Mod:</strong> {item.damageModifier >= 0 ? '+' : ''}{item.damageModifier}</div>}
                  {item.acBonus !== undefined && <div><strong>AC Bonus:</strong> +{item.acBonus}</div>}
                  {item.maxCharges !== undefined && <div><strong>Charges:</strong> {item.currentCharges ?? 0}/{item.maxCharges}</div>}
                  {item.requiresAttunement && <div><strong>Attunement:</strong> {item.attuned ? 'Attuned' : 'Required'}</div>}
                </div>
                {item.properties && <div style={{ marginTop: 4 }}><strong>Properties:</strong> {item.properties}</div>}
                {item.allowedItemTypes && item.allowedItemTypes.length > 0 && (
                  <div style={{ marginTop: 4 }}><strong>Accepts:</strong> {item.allowedItemTypes.join(', ')}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="text-muted" style={{ fontSize: 12, textAlign: 'center', padding: '8px 0' }}>Empty</div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Over-capacity warning */}
      {overCapacityWarning && (
        <div className="badge badge-danger" style={{ display: 'block', padding: '8px 12px', fontSize: 12 }}>
          ⚠ You are over capacity! Please correct your inventory.
          <button
            className="btn-icon"
            onClick={() => setOverCapacityWarning(false)}
            style={{ float: 'right', fontSize: 12, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Encumbrance */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span className="field-label">Encumbrance</span>
          <span className={`text-${enc === 'over' ? 'danger' : enc === 'combat' ? 'warning' : 'success'}`}>
            {totalWeight.toFixed(1)}u / {bagCapacity}u bag
          </span>
        </div>
        <div className="encumbrance-bar">
          <div
            className={`encumbrance-fill ${enc}`}
            style={{ width: `${Math.min(100, (totalWeight / bagCapacity) * 100)}%` }}
          />
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
          Combat encumbered ≥{combatThreshold.toFixed(1)}u · Over encumbered ≥{overThreshold.toFixed(1)}u
        </div>
        {enc !== 'normal' && (
          <div className={`text-${enc === 'over' ? 'danger' : 'warning'}`} style={{ fontSize: 11, marginTop: 2 }}>
            {enc === 'over'
              ? '⚠ Over Encumbered — DIS attacks, initiative, STR & DEX, half speed'
              : '⚡ Combat Encumbered — DIS attacks & initiative'}
          </div>
        )}
      </div>

      {/* Coins */}
      <div>
        <div className="section-header">Coins</div>
        <CoinDisplay
          coins={player.coins}
          onChange={(c) => onChange({ ...player, coins: c })}
          readonly={!canEdit}
        />
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
          Coin weight: {getCoinWeight(player.coins).toFixed(2)}u
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2 }}>
        {(['slots', 'bag', ...(hasAuxEquipped ? ['quick'] : [])] as ('slots' | 'bag' | 'quick')[]).map((tab) => (
          <button
            key={tab}
            className={`tab-button${subTab === tab ? ' active' : ''}`}
            onClick={() => setSubTab(tab)}
            style={{ flex: 1 }}
          >
            {tab === 'slots' ? '🧩 Slots' : tab === 'bag' ? '🎒 Bag' : '⚡ Quick'}
          </button>
        ))}
      </div>

      {/* Equipment Slots */}
      {subTab === 'slots' && (
        <div>
          <div className="section-header">Equipment Slots</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {EQUIPMENT_SLOTS.map(({ slot, label, icon }) => {
              const equipped = player.inventory.find((i) => i.equipped === slot);
              // SecondaryHand is blocked when a 2H weapon is in PrimaryHand
              const isBlocked = slot === 'SecondaryHand' && !!twoHandedInPrimary;
              return (
                <div key={slot} style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${equipped ? 'var(--color-primary)' : isBlocked ? 'var(--color-warning)' : 'var(--color-border-light)'}`,
                  borderRadius: 4,
                  padding: '4px 6px',
                  fontSize: 11,
                  opacity: isBlocked ? 0.7 : 1,
                }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{icon} {label}</div>
                  {equipped ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, fontWeight: 'bold', fontSize: 11,
                            color: 'var(--color-text)', textAlign: 'left', flex: 1,
                          }}
                          onClick={() => setViewingItem(equipped)}
                          title="View details"
                        >
                          {equipped.name}
                        </button>
                        {canEdit && (
                          <div style={{ display: 'flex', gap: 1 }}>
                            <button
                              className="btn-icon"
                              onClick={() => setEditingItem(equipped)}
                              title="Edit"
                              style={{ fontSize: 10 }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => toggleEquip(equipped, slot)}
                              title="Unequip"
                              style={{ fontSize: 10 }}
                            >
                              ↩
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => removeItem(equipped.id)}
                              title="Delete"
                              style={{ fontSize: 10 }}
                            >
                              🗑
                            </button>
                          </div>
                        )}
                      </div>
                      {equipped.damage && (
                        <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>⚔ {equipped.damage}</div>
                      )}
                      {equipped.acBonus !== undefined && (
                        <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>🛡 +{equipped.acBonus} AC</div>
                      )}
                    </div>
                  ) : isBlocked ? (
                    <div style={{ color: 'var(--color-warning)', fontStyle: 'italic', fontSize: 10 }}>
                      {twoHandedInPrimary!.name} (2H)
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Empty</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bag inventory */}
      {subTab === 'bag' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              Bag ({bagItems.length} items)
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {equippedBag ? `${equippedBag.name}` : 'no bag'} · {bagCapacity}u cap
              </span>
              {canEdit && (
                <button
                  className={`btn btn-sm ${player.bagDropped ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => onChange({ ...player, bagDropped: !player.bagDropped })}
                  title={player.bagDropped ? 'Pick up bag — restores bag items to encumbrance' : 'Set bag down — bag items no longer count toward encumbrance'}
                >
                  {player.bagDropped ? '🎒 Pick Up Bag' : '📦 Set Bag Down'}
                </button>
              )}
            </div>
          </div>
          {player.bagDropped && (
            <div className="badge badge-warning" style={{ display: 'block', padding: '4px 8px', marginBottom: 6, fontSize: 11 }}>
              🎒 Bag is set down — items are inaccessible and not counted toward encumbrance.
            </div>
          )}
          <div style={{ opacity: player.bagDropped ? 0.45 : 1, pointerEvents: player.bagDropped ? 'none' : 'auto' }}>
            {renderInventoryList(bagItems, true, false)}
            {canEdit && !player.bagDropped && (
              <>
                {totalWeight >= bagCapacity && (
                  <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', padding: '4px 8px', marginBottom: 4, fontSize: 11 }}>
                    🎒 Bag full — cannot add items
                  </div>
                )}
                <AddItemForm onAdd={addItem} disabled={totalWeight >= bagCapacity} />
                <ItemRepositorySearch onAddItem={addItem} disabled={totalWeight >= bagCapacity} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick/Aux inventory */}
      {subTab === 'quick' && (
        <div>
          <div className="section-header">Quick Access (Auxiliary Bags)</div>
          {renderInventoryList(quickItems, false, true)}
        </div>
      )}

      {/* Item detail view modal */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="modal" style={{ maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🔍 {viewingItem.name}</span>
              <button className="btn-icon" onClick={() => setViewingItem(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {viewingItem.category}
                {viewingItem.equipped && ` · Equipped: ${viewingItem.equipped}`}
                {` · ×${viewingItem.quantity}`}
              </div>
              {viewingItem.description && (
                <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{viewingItem.description}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
                {viewingItem.damage && <div><strong>Damage:</strong> {viewingItem.damage}</div>}
                {viewingItem.hitModifier !== undefined && <div><strong>Hit Mod:</strong> {viewingItem.hitModifier >= 0 ? '+' : ''}{viewingItem.hitModifier}</div>}
                {viewingItem.damageModifier !== undefined && <div><strong>Dmg Mod:</strong> {viewingItem.damageModifier >= 0 ? '+' : ''}{viewingItem.damageModifier}</div>}
                {viewingItem.acBonus !== undefined && <div><strong>AC Bonus:</strong> +{viewingItem.acBonus}</div>}
                {viewingItem.maxCharges !== undefined && <div><strong>Charges:</strong> {viewingItem.currentCharges ?? 0}/{viewingItem.maxCharges}</div>}
                {viewingItem.value !== undefined && <div><strong>Value:</strong> {viewingItem.value} cp</div>}
                {viewingItem.requiresAttunement && <div><strong>Attunement:</strong> {viewingItem.attuned ? '✦ Attuned' : '◇ Required'}</div>}
              </div>
              {viewingItem.properties && (
                <div style={{ fontSize: 11 }}><strong>Properties:</strong> {viewingItem.properties}</div>
              )}
            </div>
            {canEdit && (
              <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => { setEditingItem(viewingItem); setViewingItem(null); }}>✏️ Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => { removeItem(viewingItem.id); setViewingItem(null); }}>🗑 Delete</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item edit modal */}
      {editingItem && (
        <ItemEditForm
          item={editingItem}
          onChange={(updated) => {
            updateItem(updated);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Equip slot picker */}
      {equipPickerItem && (
        <EquipSlotPicker
          item={equipPickerItem}
          availableSlots={getAvailableSlots(equipPickerItem).filter((slot) => {
            if (slot === 'SecondaryHand' && twoHandedInPrimary && equipPickerItem.id !== twoHandedInPrimary.id) {
              return false;
            }
            return true;
          })}
          inventory={player.inventory}
          onEquip={(slot) => equipItem(equipPickerItem, slot)}
          onClose={() => setEquipPickerItem(null)}
        />
      )}

      {/* Aux picker for transfer */}
      {auxPickerItem && (
        <div className="modal-overlay" onClick={() => setAuxPickerItem(null)}>
          <div className="modal" style={{ maxWidth: 260 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Transfer to Auxiliary</span>
              <button className="btn-icon" onClick={() => setAuxPickerItem(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {equippedAuxSlots.map((slot) => {
                const auxItem = player.inventory.find((i) => i.equipped === slot && i.category === 'Auxiliary');
                return (
                  <button key={slot} className="btn btn-secondary"
                    onClick={() => transferToAux(auxPickerItem, slot)}>
                    ⚡ {auxItem?.name || slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

