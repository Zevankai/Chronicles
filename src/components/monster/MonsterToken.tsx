import React, { useState } from 'react';
import { MonsterData, ConditionName, CalendarConfig, Item, ItemCategory } from '../../types';
import { StatBox } from '../common/StatBox';
import { HPBar } from '../common/HPBar';
import { ConditionGrid } from '../common/ConditionBadge';
import { CoinDisplay } from '../common/CoinDisplay';
import { TabPanel } from '../common/TabPanel';
import { ItemRepositorySearch } from '../common/ItemRepositorySearch';
import { GMTab } from '../player/GMTab';
import { ATTRIBUTES, ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES } from '../../constants';
import { generateId } from '../../utils';

interface MonsterTokenProps {
  monster: MonsterData;
  onUpdate: (updated: MonsterData) => void;
  isGM: boolean;
  onLootClick?: () => void;
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
          <span className="modal-title">Edit Loot Item</span>
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

export function MonsterToken({ monster, onUpdate, isGM, onLootClick, calendar, onCalendarChange, onTokenTypeChange, playerId }: MonsterTokenProps) {
  const [showAddAbility, setShowAddAbility] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAbilityName, setNewAbilityName] = useState('');
  const [newAbilityDesc, setNewAbilityDesc] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [editingLootItem, setEditingLootItem] = useState<Item | null>(null);
  const [expandedLootId, setExpandedLootId] = useState<string | null>(null);
  const [newLootName, setNewLootName] = useState('');
  const [newLootCategory, setNewLootCategory] = useState<ItemCategory>('Other');
  const [extendedView, setExtendedView] = useState(false);

  const update = <K extends keyof MonsterData>(key: K, value: MonsterData[K]) =>
    onUpdate({ ...monster, [key]: value });

  const statusColor = monster.status === 'Alive'
    ? 'var(--color-success)'
    : monster.status === 'Dead'
    ? 'var(--color-danger)'
    : monster.status === 'Vulnerable'
    ? 'var(--color-warning)'
    : 'var(--color-warning)';

  const tabs = [
    { id: 'stats', label: '⚔️ Stats' },
    { id: 'abilities', label: '📖 Abilities' },
    { id: 'conditions', label: '💔 Conditions' },
    ...(isGM ? [{ id: 'loot', label: '💰 Loot' }, { id: 'notes', label: '📝 Notes' }, { id: 'gm', label: '🔒 GM' }] : [
      ...((monster.status === 'Dead' || monster.status === 'Vulnerable') ? [{ id: 'loot', label: '💰 Loot' }] : [])
    ]),
  ];

  const statsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Name</label>
          <input type="text" value={monster.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={!isGM} />
        </div>
        <div>
          <label className="field-label">CR</label>
          <input type="text" value={monster.challengeRating}
            onChange={(e) => update('challengeRating', e.target.value)}
            disabled={!isGM} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={monster.status}
            onChange={(e) => update('status', e.target.value as MonsterData['status'])}
            disabled={!isGM}>
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
            <option value="Fleeing">Fleeing</option>
            <option value="Vulnerable">Vulnerable</option>
          </select>
        </div>
        <div>
          <label className="field-label">XP Value</label>
          <input type="number" value={monster.xpValue} min={0}
            onChange={(e) => update('xpValue', parseInt(e.target.value) || 0)}
            disabled={!isGM} />
        </div>
      </div>

      <HPBar current={monster.currentHp} max={monster.maxHp} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Current HP</label>
          <input type="number" value={monster.currentHp}
            onChange={(e) => update('currentHp', parseInt(e.target.value) || 0)}
            disabled={!isGM} />
        </div>
        <div>
          <label className="field-label">Max HP</label>
          <input type="number" value={monster.maxHp} min={1}
            onChange={(e) => update('maxHp', parseInt(e.target.value) || 1)}
            disabled={!isGM} />
        </div>
        <div>
          <label className="field-label">AC</label>
          <input type="number" value={monster.ac} min={0}
            onChange={(e) => update('ac', parseInt(e.target.value) || 0)}
            disabled={!isGM} />
        </div>
        <div>
          <label className="field-label">Speed</label>
          <input type="number" value={monster.speed} min={0}
            onChange={(e) => update('speed', parseInt(e.target.value) || 0)}
            disabled={!isGM} />
        </div>
      </div>

      <div className="section-header">Attributes</div>
      <div className="stat-grid stat-grid-6">
        {ATTRIBUTES.map((attr) => (
          <StatBox
            key={attr}
            label={attr}
            value={monster.attributes[attr]}
            showModifier
            editable={isGM}
            onChange={(v) => onUpdate({ ...monster, attributes: { ...monster.attributes, [attr]: v } })}
          />
        ))}
      </div>

      {(monster.status === 'Dead' || monster.status === 'Vulnerable') && onLootClick && (
        <button className="btn btn-warning full-width" onClick={onLootClick}>
          💰 Loot
        </button>
      )}
    </div>
  );

  const abilitiesPanel = (
    <div>
      <div className="section-header">Abilities</div>
      {monster.abilities.map((ability) => (
        <div key={ability.id} style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 4,
          padding: 6,
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>{ability.name}</strong>
            {isGM && (
              <button className="btn-icon" onClick={() => update('abilities', monster.abilities.filter((a) => a.id !== ability.id))}>🗑</button>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{ability.description}</div>
        </div>
      ))}

      {isGM && (
        <>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAddAbility(!showAddAbility)}>
            + Add Ability
          </button>
          {showAddAbility && (
            <div style={{ marginTop: 8 }}>
              <input type="text" placeholder="Name" value={newAbilityName}
                onChange={(e) => setNewAbilityName(e.target.value)} style={{ marginBottom: 4 }} />
              <textarea placeholder="Description" value={newAbilityDesc}
                onChange={(e) => setNewAbilityDesc(e.target.value)} rows={2} style={{ marginBottom: 4 }} />
              <button className="btn btn-sm btn-primary" onClick={() => {
                if (!newAbilityName.trim()) return;
                update('abilities', [...monster.abilities, { id: generateId(), name: newAbilityName.trim(), description: newAbilityDesc.trim() }]);
                setNewAbilityName(''); setNewAbilityDesc(''); setShowAddAbility(false);
              }}>Add</button>
            </div>
          )}
        </>
      )}

      <div className="divider" />
      <div className="section-header">Actions</div>
      {monster.actions.map((action) => (
        <div key={action.id} style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 4,
          padding: 6,
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>{action.name}</strong>
            {isGM && (
              <button className="btn-icon" onClick={() => update('actions', monster.actions.filter((a) => a.id !== action.id))}>🗑</button>
            )}
          </div>
          {action.attackBonus !== undefined && (
            <div style={{ fontSize: 11 }}>Attack: +{action.attackBonus} · {action.damage}</div>
          )}
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{action.description}</div>
        </div>
      ))}
      {isGM && (
        <>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAddAction(!showAddAction)}>
            + Add Action
          </button>
          {showAddAction && (
            <div style={{ marginTop: 8 }}>
              <input type="text" placeholder="Name" value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)} style={{ marginBottom: 4 }} />
              <textarea placeholder="Description" value={newActionDesc}
                onChange={(e) => setNewActionDesc(e.target.value)} rows={2} style={{ marginBottom: 4 }} />
              <button className="btn btn-sm btn-primary" onClick={() => {
                if (!newActionName.trim()) return;
                update('actions', [...monster.actions, { id: generateId(), name: newActionName.trim(), description: newActionDesc.trim() }]);
                setNewActionName(''); setNewActionDesc(''); setShowAddAction(false);
              }}>Add</button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const conditionsPanel = (
    <div>
      <div className="section-header">Conditions</div>
      <ConditionGrid
        active={monster.conditions}
        onChange={(c) => update('conditions', c)}
        readonly={!isGM}
      />
    </div>
  );

  const lootPanel = (
    <div>
      <div className="section-header">Loot</div>
      <CoinDisplay
        coins={monster.lootCoins}
        onChange={(c) => update('lootCoins', c)}
        readonly={!isGM}
      />
      <div className="divider" />
      {monster.loot.map((item) => {
        const unitWeight = item.weight ?? ITEM_CATEGORY_WEIGHTS[item.category] ?? 1;
        const isExpanded = expandedLootId === item.id;
        return (
          <div key={item.id} style={{ marginBottom: 4 }}>
            <div className="inventory-row">
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 12, color: 'var(--color-text)' }}
                onClick={() => setExpandedLootId(isExpanded ? null : item.id)}
              >
                {item.name}
              </button>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.category}</span>
              <span style={{ fontSize: 11 }}>{(unitWeight * item.quantity).toFixed(1)}u</span>
              {isGM ? (
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="btn-icon" onClick={() => setEditingLootItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => update('loot', monster.loot.filter((l) => l.id !== item.id))}>🗑</button>
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
                </div>
                {item.properties && <div style={{ marginTop: 4 }}><strong>Properties:</strong> {item.properties}</div>}
              </div>
            )}
          </div>
        );
      })}
      {monster.loot.length === 0 && (
        <div className="text-muted" style={{ fontSize: 12 }}>No loot</div>
      )}
      {isGM && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Item name"
            value={newLootName}
            onChange={(e) => setNewLootName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newLootName.trim()) {
                update('loot', [...monster.loot, { id: generateId(), name: newLootName.trim(), category: newLootCategory, quantity: 1, equipped: null }]);
                setNewLootName('');
              }
            }}
            style={{ flex: 1, minWidth: 80 }}
          />
          <select value={newLootCategory} onChange={(e) => setNewLootCategory(e.target.value as ItemCategory)}
            style={{ flex: 1, minWidth: 80 }}>
            {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-sm btn-secondary" onClick={() => {
            if (!newLootName.trim()) return;
            update('loot', [...monster.loot, { id: generateId(), name: newLootName.trim(), category: newLootCategory, quantity: 1, equipped: null }]);
            setNewLootName('');
          }}>+ Add Loot</button>
        </div>
      )}
      {isGM && (
        <ItemRepositorySearch
          onAddItem={(item) => update('loot', [...monster.loot, item])}
        />
      )}

      {/* Claim button */}
      {monster.claimable && !isGM && (
        <div style={{ textAlign: 'center', padding: '8px 0', marginTop: 8 }}>
          {monster.claimedBy ? (
            <div className="badge badge-success" style={{ padding: '6px 12px', display: 'inline-block', fontSize: 12 }}>
              ✅ Claimed {monster.claimedBy === playerId ? '(by you)' : '(by another player)'}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playerId && onUpdate({ ...monster, claimedBy: playerId })}
            >
              🏷 Claim
            </button>
          )}
        </div>
      )}

      {editingLootItem && (
        <ItemEditForm
          item={editingLootItem}
          onChange={(updated) => {
            update('loot', monster.loot.map((i) => i.id === updated.id ? updated : i));
            setEditingLootItem(null);
          }}
          onClose={() => setEditingLootItem(null)}
        />
      )}
    </div>
  );

  const notesPanel = (
    <div>
      <label className="field-label">Notes (GM Only)</label>
      <textarea
        value={monster.notes}
        onChange={(e) => update('notes', e.target.value)}
        rows={8}
        disabled={!isGM}
      />
    </div>
  );

  const gmPanel = (
    <GMTab
      tokenType={monster.tokenType}
      claimable={monster.claimable}
      claimedBy={monster.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...monster, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels = [statsPanel, abilitiesPanel, conditionsPanel];
  if (isGM) {
    panels.push(lootPanel);
    panels.push(notesPanel);
    panels.push(gmPanel);
  } else if (monster.status === 'Dead' || monster.status === 'Vulnerable') {
    panels.push(lootPanel);
  }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          👹
        </div>
        <div style={{ flex: 1 }}>
          <div className="token-name">{monster.name}</div>
          <div className="token-subtitle">
            CR {monster.challengeRating} · {monster.currentHp}/{monster.maxHp} HP · AC {monster.ac}
          </div>
          <div className="token-subtitle" style={{ color: statusColor }}>
            ● {monster.status}
          </div>
        </div>
        <button className="btn-icon" title="Extended View" onClick={() => setExtendedView(true)} style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start' }}>⛶</button>
      </div>
      {extendedView && (
        <div className="modal-overlay" onClick={() => setExtendedView(false)}>
          <div className="modal" style={{ maxWidth: 680, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">👹 {monster.name} — Extended View</span>
              <button className="btn-icon" onClick={() => setExtendedView(false)}>✕</button>
            </div>
            <TabPanel tabs={tabs} defaultTab="stats">{panels}</TabPanel>
          </div>
        </div>
      )}
      <TabPanel tabs={tabs} defaultTab="stats">
        {panels}
      </TabPanel>
    </div>
  );
}
