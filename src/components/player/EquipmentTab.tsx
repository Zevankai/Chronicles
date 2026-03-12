import React, { useState } from 'react';
import { PlayerData, Item, ItemCategory, EquipmentSlot } from '../../types';
import { CoinDisplay } from '../common/CoinDisplay';
import { ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES } from '../../constants';
import { getInventoryWeight, getEncumbranceStatus, generateId } from '../../utils';

interface EquipmentTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
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
        style={{ flex: 1, minWidth: 100 }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ItemCategory)}
        style={{ flex: 1, minWidth: 100 }}
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
        style={{ width: 50 }}
      />
      <button className="btn btn-primary btn-sm" onClick={submit}>Add</button>
    </div>
  );
}

export function EquipmentTab({ player, onChange, canEdit }: EquipmentTabProps) {
  const totalWeight = getInventoryWeight(player.inventory);
  const enc = getEncumbranceStatus(player);

  const removeItem = (id: string) => {
    onChange({ ...player, inventory: player.inventory.filter((i) => i.id !== id) });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Encumbrance */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span className="field-label">Encumbrance</span>
          <span className={`text-${enc === 'over' ? 'danger' : enc === 'combat' ? 'warning' : 'success'}`}>
            {totalWeight.toFixed(1)} units
          </span>
        </div>
        <div className="encumbrance-bar">
          <div
            className={`encumbrance-fill ${enc}`}
            style={{ width: `${Math.min(100, (totalWeight / (player.bodyWeight * 0.5)) * 100)}%` }}
          />
        </div>
        {enc !== 'normal' && (
          <div className={`text-${enc === 'over' ? 'danger' : 'warning'}`} style={{ fontSize: 11, marginTop: 2 }}>
            {enc === 'over' ? '⚠ Over Encumbered' : '⚡ Combat Encumbered'}
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
      </div>

      {/* Inventory */}
      <div>
        <div className="section-header">Inventory</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          {player.inventory.length} item(s)
        </div>

        {player.inventory.map((item) => {
          const unitWeight = item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
          return (
            <div key={item.id} className="inventory-row">
              <span style={{ fontSize: 12 }}>
                {item.name}
                {item.equipped && (
                  <span className="badge badge-info" style={{ marginLeft: 4, fontSize: 9 }}>
                    {item.equipped}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                {item.category}
              </span>
              <span style={{ fontSize: 11, textAlign: 'right' }}>
                {(unitWeight * item.quantity).toFixed(1)}u
              </span>
              {canEdit ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="number"
                    value={item.quantity}
                    min={0}
                    onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0)}
                    style={{ width: 35, padding: '1px 2px', fontSize: 11 }}
                  />
                  <button className="btn-icon" onClick={() => removeItem(item.id)} title="Remove">🗑</button>
                </div>
              ) : (
                <span style={{ fontSize: 12 }}>×{item.quantity}</span>
              )}
            </div>
          );
        })}

        {canEdit && <AddItemForm onAdd={addItem} />}
      </div>
    </div>
  );
}
