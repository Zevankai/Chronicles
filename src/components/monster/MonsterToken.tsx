import React, { useState } from 'react';
import { MonsterData, ConditionName } from '../../types';
import { StatBox } from '../common/StatBox';
import { HPBar } from '../common/HPBar';
import { ConditionGrid } from '../common/ConditionBadge';
import { CoinDisplay } from '../common/CoinDisplay';
import { TabPanel } from '../common/TabPanel';
import { ATTRIBUTES, ITEM_CATEGORY_WEIGHTS } from '../../constants';
import { generateId } from '../../utils';
import { Item } from '../../types';

interface MonsterTokenProps {
  monster: MonsterData;
  onUpdate: (updated: MonsterData) => void;
  isGM: boolean;
  onLootClick?: () => void;
}

export function MonsterToken({ monster, onUpdate, isGM, onLootClick }: MonsterTokenProps) {
  const [showAddAbility, setShowAddAbility] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAbilityName, setNewAbilityName] = useState('');
  const [newAbilityDesc, setNewAbilityDesc] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [newActionDesc, setNewActionDesc] = useState('');

  const update = <K extends keyof MonsterData>(key: K, value: MonsterData[K]) =>
    onUpdate({ ...monster, [key]: value });

  const statusColor = monster.status === 'Alive'
    ? 'var(--color-success)'
    : monster.status === 'Dead'
    ? 'var(--color-danger)'
    : 'var(--color-warning)';

  const tabs = [
    { id: 'stats', label: '⚔️ Stats' },
    { id: 'abilities', label: '📖 Abilities' },
    { id: 'conditions', label: '💔 Conditions' },
    ...(isGM ? [{ id: 'loot', label: '💰 Loot' }, { id: 'notes', label: '📝 Notes' }] : [
      ...(monster.status === 'Dead' ? [{ id: 'loot', label: '💰 Loot' }] : [])
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

      {monster.status === 'Dead' && onLootClick && (
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
      {monster.loot.map((item) => (
        <div key={item.id} className="inventory-row">
          <span style={{ fontSize: 12 }}>{item.name}</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.category}</span>
          <span style={{ fontSize: 11 }}>{(ITEM_CATEGORY_WEIGHTS[item.category] * item.quantity).toFixed(1)}u</span>
          {isGM ? (
            <button className="btn-icon" onClick={() => update('loot', monster.loot.filter((l) => l.id !== item.id))}>🗑</button>
          ) : (
            <span style={{ fontSize: 12 }}>×{item.quantity}</span>
          )}
        </div>
      ))}
      {isGM && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const name = prompt('Item name:');
          if (name) {
            update('loot', [...monster.loot, { id: generateId(), name, category: 'Other', quantity: 1, equipped: null }]);
          }
        }}>+ Add Loot</button>
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

  const panels = [statsPanel, abilitiesPanel, conditionsPanel];
  if (isGM) {
    panels.push(lootPanel);
    panels.push(notesPanel);
  } else if (monster.status === 'Dead') {
    panels.push(lootPanel);
  }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          👹
        </div>
        <div>
          <div className="token-name">{monster.name}</div>
          <div className="token-subtitle">
            CR {monster.challengeRating} · {monster.currentHp}/{monster.maxHp} HP · AC {monster.ac}
          </div>
          <div className="token-subtitle" style={{ color: statusColor }}>
            ● {monster.status}
          </div>
        </div>
      </div>
      <TabPanel tabs={tabs} defaultTab="stats">
        {panels}
      </TabPanel>
    </div>
  );
}
