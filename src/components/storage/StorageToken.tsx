import React from 'react';
import { StorageData, StorageType, CalendarConfig } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { CoinDisplay } from '../common/CoinDisplay';
import { GMTab } from '../player/GMTab';
import { STORAGE_CAPACITIES, ITEM_CATEGORY_WEIGHTS } from '../../constants';
import { getInventoryWeight, generateId } from '../../utils';

interface StorageTokenProps {
  storage: StorageData;
  onUpdate: (updated: StorageData) => void;
  isGM: boolean;
  canAccess: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
}

export function StorageToken({ storage, onUpdate, isGM, canAccess, calendar, onCalendarChange, onTokenTypeChange }: StorageTokenProps) {
  const update = <K extends keyof StorageData>(key: K, value: StorageData[K]) =>
    onUpdate({ ...storage, [key]: value });

  const totalWeight = getInventoryWeight(storage.inventory);
  const weightPct = storage.capacity > 0 ? Math.min(100, (totalWeight / storage.capacity) * 100) : 0;

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
          {storage.inventory.map((item) => (
            <div key={item.id} className="inventory-row">
              <span style={{ fontSize: 12 }}>{item.name}</span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.category}</span>
              <span style={{ fontSize: 11 }}>{(ITEM_CATEGORY_WEIGHTS[item.category] * item.quantity).toFixed(1)}u</span>
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
                  <button className="btn-icon" onClick={() => update('inventory', storage.inventory.filter((i) => i.id !== item.id))}>🗑</button>
                </div>
              ) : (
                <span style={{ fontSize: 12 }}>×{item.quantity}</span>
              )}
            </div>
          ))}
          {canAccess && (
            <button className="btn btn-sm btn-secondary" onClick={() => {
              const name = prompt('Item name:');
              if (name) {
                update('inventory', [...storage.inventory, { id: generateId(), name, category: 'Other', quantity: 1, equipped: null }]);
              }
            }}>+ Add Item</button>
          )}
        </>
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
              update('storageType', t);
              if (t !== 'Custom') update('capacity', STORAGE_CAPACITIES[t]);
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
        <div>
          <div className="token-name">{storage.name}</div>
          <div className="token-subtitle">
            {storage.storageType} · {totalWeight.toFixed(1)}/{storage.capacity}u
          </div>
          {storage.locked && <div className="token-subtitle">🔒 Locked</div>}
        </div>
      </div>
      <TabPanel tabs={tabs} defaultTab="inventory">{panels}</TabPanel>
    </div>
  );
}
