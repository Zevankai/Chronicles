import React, { useState } from 'react';
import { PlayerData, Item, ItemCategory, EquipmentSlot } from '../../types';
import { CoinDisplay } from '../common/CoinDisplay';
import { ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES } from '../../constants';
import { getInventoryWeight, getEncumbranceStatus, generateId, getModifier } from '../../utils';

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
];

function getItemWeight(item: Item): number {
  return item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
}

function getCoinWeight(coins: { cp: number; sp: number; gp: number; pp: number }): number {
  return (coins.cp + coins.sp + coins.gp + coins.pp) * 0.01;
}

function getInventoryWeightWithCoins(player: PlayerData): number {
  const itemWeight = player.inventory.reduce((total, item) => {
    // Aux bag items don't count toward encumbrance
    const auxSlots: EquipmentSlot[] = ['Auxiliary1', 'Auxiliary2'];
    if (item.equipped && auxSlots.includes(item.equipped)) return total;
    return total + getItemWeight(item) * item.quantity;
  }, 0);
  return itemWeight + getCoinWeight(player.coins);
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

function AddItemForm({ onAdd }: { onAdd: (item: Item) => void }) {
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
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ItemCategory)}
        style={{ flex: 1, minWidth: 80 }}
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
      />
      <button className="btn btn-primary btn-sm" onClick={submit}>Add</button>
    </div>
  );
}

export function EquipmentTab({ player, onChange, canEdit }: EquipmentTabProps) {
  const [subTab, setSubTab] = useState<'slots' | 'bag' | 'quick'>('slots');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const totalWeight = getInventoryWeightWithCoins(player);
  const enc = getEncumbranceStatus(player);

  const hasAuxEquipped = player.inventory.some((i) =>
    i.equipped === 'Auxiliary1' || i.equipped === 'Auxiliary2'
  );

  const equippedBag = player.inventory.find((i) => i.equipped === 'Bag' && i.category === 'Bag');
  const bagCapacity = equippedBag?.unitCapacity ?? 15;

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
    onChange({
      ...player,
      inventory: player.inventory.map((i) => i.id === item.id ? { ...i, equipped: newEquipped } : i),
    });
  };

  const addItem = (item: Item) => {
    onChange({ ...player, inventory: [...player.inventory, item] });
  };

  // Bag inventory = items not in aux slots
  const bagItems = player.inventory.filter((i) => !i.equipped || !['Auxiliary1', 'Auxiliary2'].includes(i.equipped));
  // Quick inventory = items in aux slots
  const quickItems = player.inventory.filter((i) => i.equipped && ['Auxiliary1', 'Auxiliary2'].includes(i.equipped));

  const renderInventoryList = (items: Item[]) => (
    <div>
      {items.map((item) => {
        const unitWeight = getItemWeight(item);
        return (
          <div key={item.id} className="inventory-row" style={{ gridTemplateColumns: '1fr 55px 36px auto' }}>
            <span style={{ fontSize: 12 }}>
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
            </span>
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
                <button className="btn-icon" onClick={() => setEditingItem(item)} title="Edit">✏️</button>
                <button className="btn-icon" onClick={() => removeItem(item.id)} title="Remove">🗑</button>
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
      {/* Encumbrance */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span className="field-label">Encumbrance</span>
          <span className={`text-${enc === 'over' ? 'danger' : enc === 'combat' ? 'warning' : 'success'}`}>
            {totalWeight.toFixed(1)} / {bagCapacity}u
          </span>
        </div>
        <div className="encumbrance-bar">
          <div
            className={`encumbrance-fill ${enc}`}
            style={{ width: `${Math.min(100, (totalWeight / bagCapacity) * 100)}%` }}
          />
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
              return (
                <div key={slot} style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${equipped ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                  borderRadius: 4,
                  padding: '4px 6px',
                  fontSize: 11,
                }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{icon} {label}</div>
                  {equipped ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{equipped.name}</span>
                      {canEdit && (
                        <button className="btn-icon" onClick={() => toggleEquip(equipped, slot)} style={{ fontSize: 10 }}>✕</button>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Empty</div>
                  )}
                </div>
              );
            })}
          </div>
          {canEdit && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
              Tip: Edit an item and set its equipment slot to equip it.
            </div>
          )}
        </div>
      )}

      {/* Bag inventory */}
      {subTab === 'bag' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              Bag ({bagItems.length} items)
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              Capacity: {bagCapacity}u {equippedBag ? `(${equippedBag.name})` : '(no bag)'}
            </span>
          </div>
          {renderInventoryList(bagItems)}
          {canEdit && <AddItemForm onAdd={addItem} />}
        </div>
      )}

      {/* Quick/Aux inventory */}
      {subTab === 'quick' && (
        <div>
          <div className="section-header">Quick Access (Auxiliary Bags)</div>
          {renderInventoryList(quickItems)}
          {canEdit && <AddItemForm onAdd={(item) => addItem({ ...item, equipped: 'Auxiliary1' })} />}
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
    </div>
  );
}


interface EquipmentTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}
