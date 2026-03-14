import React, { useState } from 'react';
import { StorageData, StorageType, CalendarConfig, Item, ItemCategory } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { CoinDisplay } from '../common/CoinDisplay';
import { ItemRepositorySearch } from '../common/ItemRepositorySearch';
import { GMTab } from '../player/GMTab';
import { STORAGE_CAPACITIES, ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES } from '../../constants';
import { getInventoryWeight, generateId } from '../../utils';

interface StorageTokenProps {
  storage: StorageData;
  onUpdate: (updated: StorageData) => void;
  isGM: boolean;
  canAccess: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
  playerId?: string | null;
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
              <input type="number" value={draft.quantity} min={0}
                onChange={(e) => update('quantity', parseInt(e.target.value) || 0)} />
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
            <textarea value={draft.description || ''} onChange={(e) => update('description', e.target.value)} rows={2} />
          </div>
          {['One-Handed Weapon', 'Two-Handed Weapon'].includes(draft.category) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <label className="field-label">Damage</label>
                <input type="text" value={draft.damage || ''} placeholder="e.g. 1d8"
                  onChange={(e) => update('damage', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Hit Modifier</label>
                <input type="number" value={draft.hitModifier ?? ''} placeholder="0"
                  onChange={(e) => update('hitModifier', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
            </div>
          )}
          {['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield'].includes(draft.category) && (
            <div>
              <label className="field-label">AC Bonus</label>
              <input type="number" value={draft.acBonus ?? ''} placeholder="0" min={0}
                onChange={(e) => update('acBonus', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          )}
          <div>
            <label className="field-label">Properties / Notes</label>
            <textarea value={draft.properties || ''} onChange={(e) => update('properties', e.target.value)} rows={2} />
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

export function StorageToken({ storage, onUpdate, isGM, canAccess, calendar, onCalendarChange, onTokenTypeChange, playerId }: StorageTokenProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Other');
  const [extendedView, setExtendedView] = useState(false);

  const update = <K extends keyof StorageData>(key: K, value: StorageData[K]) =>
    onUpdate({ ...storage, [key]: value });

  const totalWeight = getInventoryWeight(storage.inventory);
  const weightPct = storage.capacity > 0 ? Math.min(100, (totalWeight / storage.capacity) * 100) : 0;

  const addItem = () => {
    if (!newItemName.trim()) return;
    update('inventory', [...storage.inventory, { id: generateId(), name: newItemName.trim(), category: newItemCategory, quantity: 1, equipped: null }]);
    setNewItemName('');
    setNewItemCategory('Other');
  };

  const tabs = [
    { id: 'inventory', label: '🎒 Inventory' },
    ...(isGM ? [{ id: 'config', label: '⚙️ Config' }, { id: 'gm', label: '🔒 GM' }] : []),
  ];

  const inventoryPanel = (
    <div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span className="field-label">Capacity</span>
          <span className={totalWeight >= storage.capacity ? 'text-danger' : ''}>
            {totalWeight.toFixed(1)} / {storage.capacity} units
          </span>
        </div>
        <div className="encumbrance-bar">
          <div
            className={`encumbrance-fill ${weightPct >= 100 ? 'over' : weightPct >= 80 ? 'combat' : 'normal'}`}
            style={{ width: `${weightPct}%` }}
          />
        </div>
      </div>

      {storage.locked && !canAccess && (
        <div className="badge badge-danger" style={{ padding: '6px 10px', display: 'block', textAlign: 'center', marginBottom: 8 }}>
          🔒 Locked {storage.lockDC ? `(DC ${storage.lockDC})` : ''}
        </div>
      )}

      {(!storage.locked || canAccess) && (
        <>
          <CoinDisplay
            coins={storage.coins}
            onChange={(c) => update('coins', c)}
            readonly={!canAccess}
          />
          <div className="divider" />
          {storage.inventory.map((item) => {
            const unitWeight = item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
            const isExpanded = expandedItemId === item.id;
            return (
              <div key={item.id} style={{ marginBottom: 4 }}>
                <div className="inventory-row">
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 12, color: 'var(--color-text)' }}
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  >
                    {item.name}
                  </button>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.category}</span>
                  <span style={{ fontSize: 11 }}>{(unitWeight * item.quantity).toFixed(1)}u</span>
                  {canAccess ? (
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={item.quantity}
                        min={0}
                        onChange={(e) => update('inventory', storage.inventory.map((i) =>
                          i.id === item.id ? { ...i, quantity: parseInt(e.target.value) || 0 } : i
                        ))}
                        style={{ width: 35, padding: '1px 2px', fontSize: 11 }}
                      />
                      {isGM && (
                        <button className="btn-icon" onClick={() => setEditingItem(item)} title="Edit">✏️</button>
                      )}
                      <button className="btn-icon" onClick={() => update('inventory', storage.inventory.filter((i) => i.id !== item.id))}>🗑</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12 }}>×{item.quantity}</span>
                  )}
                </div>
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
                    {item.description && <div style={{ marginBottom: 4, color: 'var(--color-text)' }}>{item.description}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {item.value !== undefined && <div><strong>Value:</strong> {item.value} cp</div>}
                      {item.damage && <div><strong>Damage:</strong> {item.damage}</div>}
                      {item.acBonus !== undefined && <div><strong>AC Bonus:</strong> +{item.acBonus}</div>}
                      {item.maxCharges !== undefined && <div><strong>Charges:</strong> {item.currentCharges ?? 0}/{item.maxCharges}</div>}
                    </div>
                    {item.properties && <div style={{ marginTop: 4 }}><strong>Properties:</strong> {item.properties}</div>}
                  </div>
                )}
              </div>
            );
          })}
          {canAccess && (
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                style={{ flex: 1, minWidth: 80 }}
              />
              <select value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                style={{ flex: 1, minWidth: 80 }}>
                {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-sm btn-secondary" onClick={addItem}>+ Add</button>
            </div>
          )}
          {canAccess && (
            <ItemRepositorySearch
              onAddItem={(item) => update('inventory', [...storage.inventory, item])}
            />
          )}
        </>
      )}

      {/* Claim button */}
      {storage.claimable && !isGM && (
        <div style={{ textAlign: 'center', padding: '8px 0', marginTop: 8 }}>
          {storage.claimedBy ? (
            <div className="badge badge-success" style={{ padding: '6px 12px', display: 'inline-block', fontSize: 12 }}>
              ✅ Claimed {storage.claimedBy === playerId ? '(by you)' : '(by another player)'}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playerId && onUpdate({ ...storage, claimedBy: playerId })}
            >
              🏷 Claim
            </button>
          )}
        </div>
      )}

      {editingItem && (
        <ItemEditForm
          item={editingItem}
          onChange={(updated) => {
            update('inventory', storage.inventory.map((i) => i.id === updated.id ? updated : i));
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );

  const configPanel = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label className="field-label">Name</label>
          <input type="text" value={storage.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Type</label>
          <select value={storage.storageType}
            onChange={(e) => {
              const t = e.target.value as StorageType;
              const newCapacity = t !== 'Custom' ? STORAGE_CAPACITIES[t] : storage.capacity;
              onUpdate({ ...storage, storageType: t, capacity: newCapacity });
            }}>
            {Object.keys(STORAGE_CAPACITIES).map((t) => (
              <option key={t} value={t}>{t} ({STORAGE_CAPACITIES[t as StorageType]}u)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Capacity (units)</label>
          <input type="number" value={storage.capacity} min={1}
            onChange={(e) => update('capacity', parseInt(e.target.value) || 1)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={storage.locked}
              onChange={(e) => update('locked', e.target.checked)} />
            <span className="field-label" style={{ marginBottom: 0 }}>Locked</span>
          </label>
          {storage.locked && (
            <div>
              <label className="field-label">Lock DC</label>
              <input type="number" value={storage.lockDC || 15} min={5} max={30}
                onChange={(e) => update('lockDC', parseInt(e.target.value) || 15)} />
            </div>
          )}
        </div>
      </div>
      <label className="field-label">Notes (GM Only)</label>
      <textarea value={storage.notes} onChange={(e) => update('notes', e.target.value)} rows={4} />
    </div>
  );

  const storageTypeIcons: Record<StorageType, string> = {
    SmallChest: '📦', LargeChest: '🗃️', Barrel: '🛢️', Cart: '🛒',
    Wagon: '🚌', Vault: '🏛️', Strongbox: '💰', Saddlebags: '🎒', Custom: '📦',
  };

  const gmPanel = (
    <GMTab
      tokenType={storage.tokenType}
      claimable={storage.claimable}
      claimedBy={storage.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...storage, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels = [inventoryPanel];
  if (isGM) { panels.push(configPanel); panels.push(gmPanel); }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {storageTypeIcons[storage.storageType]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="token-name">{storage.name}</div>
          <div className="token-subtitle">
            {storage.storageType} · {totalWeight.toFixed(1)}/{storage.capacity}u
          </div>
          {storage.locked && <div className="token-subtitle">🔒 Locked</div>}
        </div>
        <button className="btn-icon" title="Extended View" onClick={() => setExtendedView(true)} style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start' }}>⛶</button>
      </div>
      {extendedView && (
        <div className="modal-overlay" onClick={() => setExtendedView(false)}>
          <div className="modal" style={{ maxWidth: 680, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{storageTypeIcons[storage.storageType]} {storage.name} — Extended View</span>
              <button className="btn-icon" onClick={() => setExtendedView(false)}>✕</button>
            </div>
            <TabPanel tabs={tabs} defaultTab="inventory">{panels}</TabPanel>
          </div>
        </div>
      )}
      <TabPanel tabs={tabs} defaultTab="inventory">{panels}</TabPanel>
    </div>
  );
}
