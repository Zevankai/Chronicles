import React, { useState, useRef } from 'react';
import { CompanionData, CalendarConfig, CompanionSize, Item } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { StatBox } from '../common/StatBox';
import { HPBar } from '../common/HPBar';
import { ConditionGrid } from '../common/ConditionBadge';
import { CoinDisplay } from '../common/CoinDisplay';
import { ItemRepositorySearch } from '../common/ItemRepositorySearch';
import { GMTab } from '../player/GMTab';
import { ATTRIBUTES, ITEM_CATEGORY_WEIGHTS, COMPANION_SIZE_CAPACITY, COMPANION_SIZE_MAX_ANIMAL_AUX } from '../../constants';
import { getInventoryWeight, generateId } from '../../utils';

const DOUBLE_CLICK_DELAY_MS = 220;

interface CompanionTokenProps {
  companion: CompanionData;
  onUpdate: (updated: CompanionData) => void;
  isGM: boolean;
  canEdit: boolean;
  allowPlayerItemCreation?: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
  playerId?: string | null;
}

export function CompanionToken({ companion, onUpdate, isGM, canEdit, allowPlayerItemCreation = true, calendar, onCalendarChange, onTokenTypeChange, playerId }: CompanionTokenProps) {
  const [extendedView, setExtendedView] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

      {/* Size Category */}
      <div>
        <label className="field-label">Size Category</label>
        <select
          value={companion.size ?? 'medium'}
          onChange={(e) => {
            const newSize = e.target.value as CompanionSize;
            const newCapacity = COMPANION_SIZE_CAPACITY[newSize] ?? companion.carryCapacity;
            onUpdate({ ...companion, size: newSize, carryCapacity: newCapacity });
          }}
          disabled={!canEdit}
        >
          <option value="tiny">Tiny (max 2u — squirrel/mouse)</option>
          <option value="small">Small (max 6u — hawk/cat)</option>
          <option value="medium">Medium (max 60u — wolf/panther)</option>
          <option value="large">Large (max 500u — horse/direwolf)</option>
        </select>
        {companion.size && (
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Max {COMPANION_SIZE_CAPACITY[companion.size]}u carry · {COMPANION_SIZE_MAX_ANIMAL_AUX[companion.size]} animal auxiliary bag{COMPANION_SIZE_MAX_ANIMAL_AUX[companion.size] !== 1 ? 's' : ''} allowed
          </div>
        )}
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
      {canEdit && allowPlayerItemCreation && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const name = prompt('Item name:');
          if (name) {
            update('inventory', [...companion.inventory, { id: generateId(), name, category: 'Other', quantity: 1, equipped: null }]);
          }
        }}>+ Add Item</button>
      )}
      {canEdit && allowPlayerItemCreation && (
        <ItemRepositorySearch
          onAddItem={(item) => update('inventory', [...companion.inventory, item])}
        />
      )}
      {canEdit && !allowPlayerItemCreation && !isGM && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', padding: '4px 0' }}>
          Item creation disabled by GM.
        </div>
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

  const avatarUrl = companion.imageUrl || null;
  const zoom = companion.imageZoom ?? 1;
  const offsetX = companion.imageOffsetX ?? 0;
  const offsetY = companion.imageOffsetY ?? 0;

  const handleAvatarClick = () => {
    if (!canEdit) return;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setShowImageEditor(true);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
      }, DOUBLE_CLICK_DELAY_MS);
    }
  };

  return (
    <div>
      <div className="token-header">
        {avatarUrl ? (
          <div
            className="token-avatar"
            onClick={handleAvatarClick}
            style={{
              cursor: canEdit ? 'pointer' : 'default',
              overflow: 'hidden',
              border: '2px solid rgba(218,165,32,0.4)',
              position: 'relative',
            }}
            title={canEdit ? 'Double-click to edit image' : undefined}
          >
            <img
              src={avatarUrl}
              alt={companion.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                transformOrigin: 'center',
              }}
            />
          </div>
        ) : (
          <div
            className="token-avatar"
            onClick={handleAvatarClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: canEdit ? 'pointer' : 'default' }}
            title={canEdit ? 'Double-click to add image' : undefined}
          >
            🐾
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div className="token-name">{companion.name}</div>
          <div className="token-subtitle">{companion.currentHp}/{companion.maxHp} HP · AC {companion.ac}</div>
          <div className="token-subtitle">Companion{companion.size ? ` · ${companion.size.charAt(0).toUpperCase() + companion.size.slice(1)}` : ''}</div>
        </div>
        <button className="btn-icon" title="Extended View" onClick={() => setExtendedView(true)} style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start' }}>⛶</button>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && canEdit && (
        <div className="modal-overlay" onClick={() => setShowImageEditor(false)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🖼 Image Settings</span>
              <button className="btn-icon" onClick={() => setShowImageEditor(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="field-label">Image URL</label>
                <input
                  type="url"
                  value={companion.imageUrl ?? ''}
                  onChange={(e) => update('imageUrl', e.target.value || undefined)}
                  placeholder="https://... image URL"
                />
              </div>
              {avatarUrl && (
                <>
                  <div>
                    <label className="field-label">Zoom ({(zoom * 100).toFixed(0)}%)</label>
                    <input
                      type="range" min={1} max={3} step={0.05} value={zoom}
                      onChange={(e) => update('imageZoom', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="field-label">Offset X ({offsetX}px)</label>
                      <input type="range" min={-50} max={50} step={1} value={offsetX}
                        onChange={(e) => update('imageOffsetX', parseInt(e.target.value))}
                        style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label className="field-label">Offset Y ({offsetY}px)</label>
                      <input type="range" min={-50} max={50} step={1} value={offsetY}
                        onChange={(e) => update('imageOffsetY', parseInt(e.target.value))}
                        style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-gold)' }}>
                      <img src={avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`, transformOrigin: 'center' }} />
                    </div>
                  </div>
                  <button className="btn btn-sm btn-secondary"
                    onClick={() => onUpdate({ ...companion, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0 })}>
                    Reset Zoom/Offset
                  </button>
                </>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => setShowImageEditor(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {extendedView && (
        <div className="modal-overlay" onClick={() => setExtendedView(false)}>
          <div className="modal" style={{ maxWidth: 680, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🐾 {companion.name} — Extended View</span>
              <button className="btn-icon" onClick={() => setExtendedView(false)}>✕</button>
            </div>
            <TabPanel tabs={tabs} defaultTab="stats">{panels}</TabPanel>
          </div>
        </div>
      )}
      <TabPanel tabs={tabs} defaultTab="stats">{panels}</TabPanel>
    </div>
  );
}
