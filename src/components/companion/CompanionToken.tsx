import React from 'react';
import { CompanionData, CalendarConfig } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { StatBox } from '../common/StatBox';
import { HPBar } from '../common/HPBar';
import { ConditionGrid } from '../common/ConditionBadge';
import { CoinDisplay } from '../common/CoinDisplay';
import { GMTab } from '../player/GMTab';
import { ATTRIBUTES, ITEM_CATEGORY_WEIGHTS } from '../../constants';
import { getInventoryWeight, generateId } from '../../utils';

interface CompanionTokenProps {
  companion: CompanionData;
  onUpdate: (updated: CompanionData) => void;
  isGM: boolean;
  canEdit: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
  playerId?: string | null;
}

export function CompanionToken({ companion, onUpdate, isGM, canEdit, calendar, onCalendarChange, onTokenTypeChange, playerId }: CompanionTokenProps) {
  const update = <K extends keyof CompanionData>(key: K, value: CompanionData[K]) =>
    onUpdate({ ...companion, [key]: value });

  const totalWeight = getInventoryWeight(companion.inventory);
  const weightPct = companion.carryCapacity > 0
    ? Math.min(100, (totalWeight / companion.carryCapacity) * 100)
    : 0;

  const tabs = [
    { id: 'stats', label: '⚔️ Stats' },
    { id: 'inventory', label: '🎒 Inventory' },
    { id: 'conditions', label: '💔 Conditions' },
    ...(isGM ? [{ id: 'notes', label: '📝 Notes' }, { id: 'gm', label: '🔒 GM' }] : []),
  ];

  const statsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Name</label>
          <input type="text" value={companion.name}
            onChange={(e) => update('name', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={companion.status}
            onChange={(e) => update('status', e.target.value as CompanionData['status'])}
            disabled={!canEdit}>
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
            <option value="Fleeing">Fleeing</option>
          </select>
        </div>
      </div>

      <HPBar current={companion.currentHp} max={companion.maxHp} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Current HP</label>
          <input type="number" value={companion.currentHp}
            onChange={(e) => update('currentHp', parseInt(e.target.value) || 0)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Max HP</label>
          <input type="number" value={companion.maxHp} min={1}
            onChange={(e) => update('maxHp', parseInt(e.target.value) || 1)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">AC</label>
          <input type="number" value={companion.ac} min={0}
            onChange={(e) => update('ac', parseInt(e.target.value) || 0)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Speed</label>
          <input type="number" value={companion.speed} min={0}
            onChange={(e) => update('speed', parseInt(e.target.value) || 0)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Carry Capacity</label>
          <input type="number" value={companion.carryCapacity} min={0}
            onChange={(e) => update('carryCapacity', parseInt(e.target.value) || 0)} disabled={!canEdit} />
        </div>
      </div>

      <div className="section-header">Attributes</div>
      <div className="stat-grid stat-grid-6">
        {ATTRIBUTES.map((attr) => (
          <StatBox
            key={attr}
            label={attr}
            value={companion.attributes[attr]}
            showModifier
            editable={canEdit}
            onChange={(v) => onUpdate({ ...companion, attributes: { ...companion.attributes, [attr]: v } })}
          />
        ))}
      </div>
    </div>
  );

  const inventoryPanel = (
    <div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span className="field-label">Carry Weight</span>
          <span>{totalWeight.toFixed(1)} / {companion.carryCapacity} units</span>
        </div>
        <div className="encumbrance-bar">
          <div
            className={`encumbrance-fill ${weightPct >= 100 ? 'over' : weightPct >= 75 ? 'combat' : 'normal'}`}
            style={{ width: `${weightPct}%` }}
          />
        </div>
      </div>

      <CoinDisplay
        coins={companion.coins}
        onChange={(c) => update('coins', c)}
        readonly={!canEdit}
      />

      <div className="divider" />
      {companion.inventory.map((item) => (
        <div key={item.id} className="inventory-row">
          <span style={{ fontSize: 12 }}>{item.name}</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.category}</span>
          <span style={{ fontSize: 11 }}>{(ITEM_CATEGORY_WEIGHTS[item.category] * item.quantity).toFixed(1)}u</span>
          {canEdit ? (
            <button className="btn-icon" onClick={() => update('inventory', companion.inventory.filter((i) => i.id !== item.id))}>🗑</button>
          ) : (
            <span style={{ fontSize: 12 }}>×{item.quantity}</span>
          )}
        </div>
      ))}
      {canEdit && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const name = prompt('Item name:');
          if (name) {
            update('inventory', [...companion.inventory, { id: generateId(), name, category: 'Other', quantity: 1, equipped: null }]);
          }
        }}>+ Add Item</button>
      )}

      {/* Claim button */}
      {companion.claimable && !isGM && (
        <div style={{ textAlign: 'center', padding: '8px 0', marginTop: 8 }}>
          {companion.claimedBy ? (
            <div className="badge badge-success" style={{ padding: '6px 12px', display: 'inline-block', fontSize: 12 }}>
              ✅ Claimed {companion.claimedBy === playerId ? '(by you)' : '(by another player)'}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playerId && onUpdate({ ...companion, claimedBy: playerId })}
            >
              🏷 Claim
            </button>
          )}
        </div>
      )}
    </div>
  );

  const conditionsPanel = (
    <div>
      <div className="section-header">Conditions</div>
      <ConditionGrid
        active={companion.conditions}
        onChange={(c) => update('conditions', c)}
        readonly={!canEdit}
      />
    </div>
  );

  const notesPanel = (
    <div>
      <label className="field-label">Notes</label>
      <textarea value={companion.notes} onChange={(e) => update('notes', e.target.value)} rows={8} disabled={!canEdit} />
    </div>
  );

  const gmPanel = (
    <GMTab
      tokenType={companion.tokenType}
      claimable={companion.claimable}
      claimedBy={companion.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...companion, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels = [statsPanel, inventoryPanel, conditionsPanel];
  if (isGM) { panels.push(notesPanel); panels.push(gmPanel); }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐾</div>
        <div>
          <div className="token-name">{companion.name}</div>
          <div className="token-subtitle">{companion.currentHp}/{companion.maxHp} HP · AC {companion.ac}</div>
          <div className="token-subtitle">Companion</div>
        </div>
      </div>
      <TabPanel tabs={tabs} defaultTab="stats">{panels}</TabPanel>
    </div>
  );
}
