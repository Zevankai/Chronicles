import React, { useState } from 'react';
import { PlayerData, Spell, SpellSlots } from '../../types';
import { generateId } from '../../utils';

interface SpellsTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

function SpellSlotRow({
  level,
  slots,
  onToggle,
  onChange,
  canEdit,
}: {
  level: number;
  slots: { total: number; used: number };
  onToggle: (used: number) => void;
  onChange: (total: number) => void;
  canEdit: boolean;
}) {
  if (slots.total === 0 && !canEdit) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '50px 40px 1fr', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 'bold' }}>Level {level}</span>
      {canEdit ? (
        <input
          type="number"
          value={slots.total}
          min={0}
          max={9}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          style={{ padding: '1px 4px', fontSize: 12 }}
        />
      ) : (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{slots.total}</span>
      )}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: slots.total }, (_, i) => (
          <div
            key={i}
            className={`spell-slot ${i < slots.used ? 'used' : 'available'}`}
            onClick={() => onToggle(i < slots.used ? i : i + 1)}
            title={i < slots.used ? 'Used' : 'Available'}
          />
        ))}
      </div>
    </div>
  );
}

function AddSpellForm({ onAdd }: { onAdd: (spell: Spell) => void }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(0);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: generateId(),
      name: name.trim(),
      level,
      school: '',
      castingTime: '1 action',
      range: '30 ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: '',
      prepared: false,
      ritual: false,
      concentration: false,
    });
    setName('');
    setLevel(0);
  };

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '6px 0' }}>
      <input
        type="text"
        placeholder="Spell name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flex: 1, minWidth: 100 }}
      />
      <select value={level} onChange={(e) => setLevel(parseInt(e.target.value))}>
        <option value={0}>Cantrip</option>
        {[1,2,3,4,5,6,7,8,9].map((l) => (
          <option key={l} value={l}>Level {l}</option>
        ))}
      </select>
      <button className="btn btn-primary btn-sm" onClick={submit}>Add</button>
    </div>
  );
}

export function SpellsTab({ player, onChange, canEdit }: SpellsTabProps) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const updateSlot = (level: number, used: number) => {
    onChange({
      ...player,
      spellSlots: {
        ...player.spellSlots,
        [level]: { ...player.spellSlots[level as keyof SpellSlots], used },
      },
    });
  };

  const updateSlotTotal = (level: number, total: number) => {
    onChange({
      ...player,
      spellSlots: {
        ...player.spellSlots,
        [level]: { ...player.spellSlots[level as keyof SpellSlots], total, used: 0 },
      },
    });
  };

  const addSpell = (spell: Spell) => {
    onChange({ ...player, spells: [...player.spells, spell] });
  };

  const removeSpell = (id: string) => {
    onChange({ ...player, spells: player.spells.filter((s) => s.id !== id) });
  };

  const togglePrepared = (id: string) => {
    onChange({
      ...player,
      spells: player.spells.map((s) => s.id === id ? { ...s, prepared: !s.prepared } : s),
    });
  };

  return (
    <div>
      {/* Spell Slots */}
      <div className="section-header">Spell Slots</div>
      {([1,2,3,4,5,6,7,8,9] as const).map((level) => (
        <SpellSlotRow
          key={level}
          level={level}
          slots={player.spellSlots[level]}
          onToggle={(used) => updateSlot(level, used)}
          onChange={(total) => updateSlotTotal(level, total)}
          canEdit={canEdit}
        />
      ))}

      <div className="divider" />

      {/* Spellbook */}
      <div className="section-header">Spellbook ({player.spells.length})</div>

      {[0,1,2,3,4,5,6,7,8,9].map((level) => {
        const levelSpells = player.spells.filter((s) => s.level === level);
        if (levelSpells.length === 0) return null;
        return (
          <div key={level} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 4 }}>
              {level === 0 ? 'Cantrips' : `Level ${level}`}
            </div>
            {levelSpells.map((spell) => (
              <div key={spell.id} style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 4,
                padding: 6,
                marginBottom: 3,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {level > 0 && (
                      <input
                        type="checkbox"
                        checked={spell.prepared}
                        onChange={() => togglePrepared(spell.id)}
                        title="Prepared"
                        disabled={!canEdit}
                      />
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => setExpandedSpell(expandedSpell === spell.id ? null : spell.id)}
                      style={{ fontWeight: 'bold', fontSize: 12, color: 'var(--color-text)' }}
                    >
                      {spell.name}
                    </button>
                    {spell.ritual && <span className="badge badge-info" style={{ fontSize: 9 }}>R</span>}
                    {spell.concentration && <span className="badge badge-warning" style={{ fontSize: 9 }}>C</span>}
                  </div>
                  {canEdit && (
                    <button className="btn-icon" onClick={() => removeSpell(spell.id)}>🗑</button>
                  )}
                </div>

                {expandedSpell === spell.id && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                    <div><strong>Range:</strong> {spell.range}</div>
                    <div><strong>Components:</strong> {spell.components}</div>
                    <div><strong>Duration:</strong> {spell.duration}</div>
                    {spell.description && (
                      <div style={{ marginTop: 4, color: 'var(--color-text)' }}>{spell.description}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {canEdit && <AddSpellForm onAdd={addSpell} />}
    </div>
  );
}
