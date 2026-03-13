import React, { useState } from 'react';
import { PlayerData, Spell, SpellSlots } from '../../types';
import { generateId, getPreparedSpellMax, getSpellSlots, getMaxCantrips, isPreparedCaster, isCasterClass } from '../../utils';
import { SPELLCASTING_ABILITY } from '../../constants';

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

function SpellEditor({
  spell,
  onChange,
  onClose,
}: {
  spell: Spell;
  onChange: (updated: Spell) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...spell });

  const update = <K extends keyof Spell>(key: K, value: Spell[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit Spell</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label className="field-label">Name</label>
              <input type="text" value={draft.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Level</label>
              <select value={draft.level} onChange={(e) => update('level', parseInt(e.target.value))}>
                <option value={0}>Cantrip</option>
                {[1,2,3,4,5,6,7,8,9].map((l) => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">School</label>
              <input type="text" value={draft.school} onChange={(e) => update('school', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Casting Time</label>
              <input type="text" value={draft.castingTime} onChange={(e) => update('castingTime', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Range</label>
              <input type="text" value={draft.range} onChange={(e) => update('range', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Components</label>
              <input type="text" value={draft.components} onChange={(e) => update('components', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Duration</label>
              <input type="text" value={draft.duration} onChange={(e) => update('duration', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={draft.prepared} onChange={(e) => update('prepared', e.target.checked)} />
              Prepared
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={draft.ritual} onChange={(e) => update('ritual', e.target.checked)} />
              Ritual
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={draft.concentration} onChange={(e) => update('concentration', e.target.checked)} />
              Concentration
            </label>
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              placeholder="Spell description..."
            />
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

export function SpellsTab({ player, onChange, canEdit }: SpellsTabProps) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);

  // Determine spellcasting class (use spellcastingClass override or fall back to playerClass)
  const castingClass = (player.spellcastingClass || player.playerClass || '').toLowerCase();
  const isKnownCaster = isCasterClass(castingClass);
  const isPrepared = isPreparedCaster(castingClass);
  const spellcastingAbility = SPELLCASTING_ABILITY[castingClass];
  const preparedMax = isPrepared
    ? getPreparedSpellMax(castingClass, player.level, player.attributes)
    : 0;
  const maxCantrips = isKnownCaster ? getMaxCantrips(player.level) : null;

  const nonCantripSpells = player.spells.filter((s) => s.level > 0);
  const preparedCount = nonCantripSpells.filter((s) => s.prepared).length;
  const cantripCount = player.spells.filter((s) => s.level === 0).length;

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

  const syncSlotsFromClass = () => {
    if (!isKnownCaster) return;
    const newSlots = getSpellSlots(castingClass, player.level, player.spellSlots);
    onChange({ ...player, spellSlots: newSlots });
  };

  const addSpell = (spell: Spell) => {
    onChange({ ...player, spells: [...player.spells, spell] });
  };

  const removeSpell = (id: string) => {
    onChange({ ...player, spells: player.spells.filter((s) => s.id !== id) });
  };

  const updateSpell = (updated: Spell) => {
    onChange({
      ...player,
      spells: player.spells.map((s) => s.id === updated.id ? updated : s),
    });
  };

  const togglePrepared = (id: string) => {
    const spell = player.spells.find((s) => s.id === id);
    if (!spell) return;

    // Enforce preparation limit for prepared casters
    if (isPrepared && !spell.prepared && preparedCount >= preparedMax) {
      alert(`You can only prepare ${preparedMax} spell${preparedMax !== 1 ? 's' : ''} (${castingClass} level ${player.level} with ${spellcastingAbility} modifier).`);
      return;
    }

    onChange({
      ...player,
      spells: player.spells.map((s) => s.id === id ? { ...s, prepared: !s.prepared } : s),
    });
  };

  return (
    <div>
      {/* Spellcasting info banner for known casters */}
      {isKnownCaster && (
        <div style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 4,
          padding: '6px 8px',
          marginBottom: 8,
          fontSize: 11,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {castingClass}
          </span>
          {spellcastingAbility && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              Spellcasting: <strong style={{ color: 'var(--color-text)' }}>{spellcastingAbility}</strong>
            </span>
          )}
          {maxCantrips !== null && (
            <span style={{ color: cantripCount > maxCantrips ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
              Cantrips: <strong style={{ color: 'var(--color-text)' }}>{cantripCount}/{maxCantrips}</strong>
            </span>
          )}
          {isPrepared && (
            <span style={{ color: preparedCount > preparedMax ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
              Prepared: <strong style={{ color: preparedCount > preparedMax ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {preparedCount}/{preparedMax}
              </strong>
            </span>
          )}
          {canEdit && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={syncSlotsFromClass}
              title={`Auto-set spell slots for ${castingClass} level ${player.level}`}
              style={{ marginLeft: 'auto', fontSize: 10 }}
            >
              ⚡ Sync Slots
            </button>
          )}
        </div>
      )}

      {/* Spellcasting class override (for multiclass or non-standard) */}
      {canEdit && (
        <div style={{ marginBottom: 8 }}>
          <label className="field-label">Spellcasting Class Override</label>
          <input
            type="text"
            value={player.spellcastingClass ?? ''}
            onChange={(e) => onChange({ ...player, spellcastingClass: e.target.value || undefined })}
            placeholder={`Defaults to "${player.playerClass || 'class'}" — override for multiclass`}
            style={{ fontSize: 11 }}
          />
        </div>
      )}

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
            <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {level === 0 ? 'Cantrips' : `Level ${level}`}
              {level === 0 && maxCantrips !== null && (
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                  (always available · {cantripCount}/{maxCantrips})
                </span>
              )}
              {level > 0 && isPrepared && (
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                  (✓ = prepared)
                </span>
              )}
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
                        title={isPrepared ? `Prepared (${preparedCount}/${preparedMax})` : 'Prepared'}
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
                  <div style={{ display: 'flex', gap: 2 }}>
                    {canEdit && (
                      <button className="btn-icon" onClick={() => setEditingSpell(spell)} title="Edit">✏️</button>
                    )}
                    {canEdit && (
                      <button className="btn-icon" onClick={() => removeSpell(spell.id)}>🗑</button>
                    )}
                  </div>
                </div>

                {expandedSpell === spell.id && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {spell.school && <div><strong>School:</strong> {spell.school}</div>}
                    <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                    <div><strong>Range:</strong> {spell.range}</div>
                    <div><strong>Components:</strong> {spell.components}</div>
                    <div><strong>Duration:</strong> {spell.duration}</div>
                    {spell.description && (
                      <div style={{ marginTop: 4, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{spell.description}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {canEdit && <AddSpellForm onAdd={addSpell} />}

      {editingSpell && (
        <SpellEditor
          spell={editingSpell}
          onChange={updateSpell}
          onClose={() => setEditingSpell(null)}
        />
      )}
    </div>
  );
}

