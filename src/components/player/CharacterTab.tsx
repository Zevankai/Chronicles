import React, { useState } from 'react';
import { PlayerData, Alignment, Scar, InjurySeverity, BodyLocation } from '../../types';
import { ALIGNMENTS } from '../../constants';
import { generateId } from '../../utils';

interface CharacterTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

export function CharacterTab({ player, onChange, canEdit }: CharacterTabProps) {
  const [editingScarId, setEditingScarId] = useState<string | null>(null);
  const [newScarDesc, setNewScarDesc] = useState('');
  const [newScarSeverity, setNewScarSeverity] = useState<InjurySeverity>('minor');
  const [newScarLocation, setNewScarLocation] = useState<BodyLocation>('Limb');
  const [showAddScar, setShowAddScar] = useState(false);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const TextArea = ({ label, field }: { label: string; field: keyof PlayerData }) => (
    <div style={{ marginBottom: 8 }}>
      <label className="field-label">{label}</label>
      <textarea
        value={player[field] as string}
        onChange={(e) => update(field, e.target.value as PlayerData[typeof field])}
        disabled={!canEdit}
        rows={3}
      />
    </div>
  );

  const scars: Scar[] = player.scars || [];

  const addScar = () => {
    if (!newScarDesc.trim()) return;
    const scar: Scar = {
      id: generateId(),
      description: newScarDesc.trim(),
      severity: newScarSeverity,
      location: newScarLocation,
    };
    update('scars', [...scars, scar]);
    setNewScarDesc('');
    setShowAddScar(false);
  };

  const updateScar = (id: string, desc: string) => {
    update('scars', scars.map((s) => s.id === id ? { ...s, description: desc } : s));
    setEditingScarId(null);
  };

  const removeScar = (id: string) => {
    update('scars', scars.filter((s) => s.id !== id));
  };

  return (
    <div>
      {/* Identity */}
      <div className="section-header">Identity</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        <div>
          <label className="field-label">Alignment</label>
          <select
            value={player.alignment}
            onChange={(e) => update('alignment', e.target.value as Alignment)}
            disabled={!canEdit}
          >
            {ALIGNMENTS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Gender</label>
          <input type="text" value={player.gender}
            onChange={(e) => update('gender', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Age</label>
          <input type="text" value={player.age}
            onChange={(e) => update('age', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Height</label>
          <input type="text" value={player.height}
            onChange={(e) => update('height', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Weight</label>
          <input type="text" value={player.weight}
            onChange={(e) => update('weight', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Eyes</label>
          <input type="text" value={player.eyes}
            onChange={(e) => update('eyes', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Hair</label>
          <input type="text" value={player.hair}
            onChange={(e) => update('hair', e.target.value)} disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Skin</label>
          <input type="text" value={player.skin}
            onChange={(e) => update('skin', e.target.value)} disabled={!canEdit} />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="field-label">Journal URL</label>
        <input type="url" value={player.journalUrl}
          onChange={(e) => update('journalUrl', e.target.value)} disabled={!canEdit} />
        {player.journalUrl && (
          <a href={player.journalUrl} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm btn-secondary" style={{ marginTop: 4, display: 'inline-block' }}>
            Open Journal ↗
          </a>
        )}
      </div>

      <div className="divider" />

      {/* Narrative */}
      <div className="section-header">Character</div>
      <TextArea label="Class Features" field="classFeatures" />
      <TextArea label="Species Features" field="speciesFeatures" />
      <TextArea label="Feats" field="feats" />
      <TextArea label="Background" field="background" />
      <TextArea label="Appearance" field="appearance" />
      <TextArea label="Personality" field="personality" />
      <TextArea label="Flaws" field="flaws" />
      <TextArea label="Relationships" field="relationships" />

      {/* Scars */}
      <div className="divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Scars ({scars.length})</div>
        {canEdit && (
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAddScar(!showAddScar)}>
            + Add Scar
          </button>
        )}
      </div>

      {showAddScar && canEdit && (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: 4, padding: 8, marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <div>
              <label className="field-label">Severity</label>
              <select value={newScarSeverity} onChange={(e) => setNewScarSeverity(e.target.value as InjurySeverity)}>
                <option value="minor">Minor</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="field-label">Location</label>
              <select value={newScarLocation} onChange={(e) => setNewScarLocation(e.target.value as BodyLocation)}>
                <option value="Limb">Limb</option>
                <option value="Torso">Torso</option>
                <option value="Head">Head</option>
              </select>
            </div>
          </div>
          <textarea
            value={newScarDesc}
            onChange={(e) => setNewScarDesc(e.target.value)}
            placeholder="Describe the scar..."
            rows={2}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => { setShowAddScar(false); setNewScarDesc(''); }}>Cancel</button>
            <button className="btn btn-sm btn-primary" onClick={addScar}>Add</button>
          </div>
        </div>
      )}

      {scars.length === 0 && !showAddScar && (
        <div className="text-muted" style={{ fontSize: 12 }}>No scars</div>
      )}

      {scars.map((scar) => (
        <div key={scar.id} className={`injury-card ${scar.severity}`} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                [{scar.severity.toUpperCase()}] {scar.location}
              </div>
              {editingScarId === scar.id ? (
                <div>
                  <textarea
                    value={scar.description}
                    onChange={(e) => update('scars', scars.map((s) => s.id === scar.id ? { ...s, description: e.target.value } : s))}
                    rows={2}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingScarId(null)}>Cancel</button>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingScarId(null)}>Save</button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12 }}>{scar.description}</div>
              )}
            </div>
            {canEdit && editingScarId !== scar.id && (
              <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                <button className="btn-icon" onClick={() => setEditingScarId(scar.id)} title="Edit">✏️</button>
                <button className="btn-icon" onClick={() => removeScar(scar.id)} title="Remove">🗑</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


interface CharacterTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

