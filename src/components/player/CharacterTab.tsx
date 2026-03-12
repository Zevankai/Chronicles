import React from 'react';
import { PlayerData, Alignment } from '../../types';
import { ALIGNMENTS } from '../../constants';

interface CharacterTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

export function CharacterTab({ player, onChange, canEdit }: CharacterTabProps) {
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

  const healedInjuries = player.injuries.filter((i) => i.healed);

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

      {/* Scars (from healed injuries) */}
      {healedInjuries.length > 0 && (
        <div>
          <div className="section-header">Scars</div>
          {healedInjuries.map((injury) => (
            <div key={injury.id} style={{ fontSize: 12, marginBottom: 4, color: 'var(--color-text-muted)' }}>
              [{injury.severity}] {injury.location}: {injury.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
