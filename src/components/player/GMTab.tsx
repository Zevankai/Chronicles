import React from 'react';
import { PlayerData } from '../../types';
import { DEFAULT_EXHAUSTION_EFFECTS } from '../../constants';

interface GMTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
}

export function GMTab({ player, onChange }: GMTabProps) {
  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const exhaustionConfig = player.exhaustionConfig?.length ? player.exhaustionConfig : DEFAULT_EXHAUSTION_EFFECTS;

  const updateExhaustionEffect = (level: number, effect: string) => {
    const config = exhaustionConfig.map((e) =>
      e.level === level ? { ...e, effect } : e
    );
    update('exhaustionConfig', config);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* XP & Inspiration */}
      <div>
        <div className="section-header">Advancement</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="field-label">Experience Points</label>
            <input
              type="number"
              value={player.xp}
              min={0}
              onChange={(e) => update('xp', parseInt(e.target.value) || 0)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={player.inspiration}
                onChange={(e) => update('inspiration', e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Inspiration</span>
            </label>
          </div>
        </div>
      </div>

      {/* Death Saves */}
      <div>
        <div className="section-header">Death Saves</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="field-label">Successes</label>
            <input
              type="number"
              value={player.deathSaves.successes}
              min={0}
              max={3}
              onChange={(e) => update('deathSaves', { ...player.deathSaves, successes: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="field-label">Failures</label>
            <input
              type="number"
              value={player.deathSaves.failures}
              min={0}
              max={3}
              onChange={(e) => update('deathSaves', { ...player.deathSaves, failures: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Hidden Notes */}
      <div>
        <label className="field-label">Hidden Notes (GM Only)</label>
        <textarea
          value={player.hiddenNotes}
          onChange={(e) => update('hiddenNotes', e.target.value)}
          rows={5}
          placeholder="Private notes visible only to GM..."
        />
      </div>

      {/* Exhaustion Config */}
      <div>
        <div className="section-header">Exhaustion Level Effects</div>
        {exhaustionConfig.map((e) => (
          <div key={e.level} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 6, marginBottom: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--color-primary)' }}>
              L{e.level}
            </span>
            <input
              type="text"
              value={e.effect}
              onChange={(ev) => updateExhaustionEffect(e.level, ev.target.value)}
            />
          </div>
        ))}
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => update('exhaustionConfig', DEFAULT_EXHAUSTION_EFFECTS)}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
