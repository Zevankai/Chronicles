import React, { useState } from 'react';
import { PlayerData, Injury, InjurySeverity, BodyLocation } from '../../types';
import { ConditionGrid } from '../common/ConditionBadge';
import { ExhaustionBar } from '../common/ExhaustionBar';
import { DEFAULT_EXHAUSTION_EFFECTS, LONG_REST_OPTIONS, SHORT_REST_OPTIONS, LONG_REST_PICK, SHORT_REST_PICK } from '../../constants';
import { generateId } from '../../utils';

interface ConditionsTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
  isGM: boolean;
}

export function ConditionsTab({ player, onChange, canEdit, isGM }: ConditionsTabProps) {
  const [showRestModal, setShowRestModal] = useState<'long' | 'short' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const exhaustionConfig = (player.exhaustionConfig?.length ? player.exhaustionConfig : DEFAULT_EXHAUSTION_EFFECTS);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const addInjury = (severity: InjurySeverity, location: BodyLocation) => {
    const injury: Injury = {
      id: generateId(),
      severity,
      location,
      description: `${severity} ${location} injury`,
      healed: false,
      timestamp: Date.now(),
    };
    update('injuries', [...player.injuries, injury]);
  };

  const healInjury = (id: string) => {
    update('injuries', player.injuries.map((i) => i.id === id ? { ...i, healed: true } : i));
  };

  const doRest = () => {
    const maxPick = showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK;
    if (selectedOptions.length < maxPick) return;

    let updates: Partial<PlayerData> = {};
    if (showRestModal === 'long') {
      updates = {
        currentHp: player.maxHp,
        exhaustionLevel: Math.max(0, player.exhaustionLevel - 1),
        spellSlots: Object.fromEntries(
          Object.entries(player.spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
        ) as PlayerData['spellSlots'],
        lastRestBonus: {
          restType: 'long',
          selectedOptions,
          details: {},
          used: [],
          timestamp: Date.now(),
        },
      };
    } else {
      const healAmount = Math.floor(player.maxHp * 0.25);
      updates = {
        currentHp: Math.min(player.maxHp, player.currentHp + healAmount),
        lastRestBonus: {
          restType: 'short',
          selectedOptions,
          details: {},
          used: [],
          timestamp: Date.now(),
        },
      };
    }

    onChange({ ...player, ...updates });
    setShowRestModal(null);
    setSelectedOptions([]);
  };

  const toggleOption = (opt: string, maxPick: number) => {
    if (selectedOptions.includes(opt)) {
      setSelectedOptions(selectedOptions.filter((x) => x !== opt));
    } else if (selectedOptions.length < maxPick) {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Conditions */}
      <div>
        <div className="section-header">Conditions</div>
        <ConditionGrid
          active={player.conditions}
          onChange={(c) => update('conditions', c)}
          readonly={!canEdit}
        />
      </div>

      {/* Exhaustion */}
      <div>
        <div className="section-header">Exhaustion</div>
        <ExhaustionBar
          level={player.exhaustionLevel}
          config={exhaustionConfig}
          onChange={(l) => update('exhaustionLevel', l)}
          readonly={!canEdit}
        />
      </div>

      {/* Injuries */}
      <div>
        <div className="section-header">Injuries</div>
        {player.injuries.filter((i) => !i.healed).map((injury) => (
          <div key={injury.id} className={`injury-card ${injury.severity}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <strong>{injury.severity.toUpperCase()}</strong> — {injury.location}: {injury.description}
              </span>
              {canEdit && (
                <button className="btn btn-sm btn-success" onClick={() => healInjury(injury.id)}>
                  Heal
                </button>
              )}
            </div>
          </div>
        ))}
        {player.injuries.filter((i) => !i.healed).length === 0 && (
          <div className="text-muted" style={{ fontSize: 12 }}>No active injuries</div>
        )}
        {isGM && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="field-label">Add Injury:</span>
            {(['minor', 'severe', 'critical'] as InjurySeverity[]).map((sev) => (
              ['Limb', 'Torso', 'Head'].map((loc) => (
                <button
                  key={`${sev}-${loc}`}
                  className="btn btn-sm btn-secondary"
                  onClick={() => addInjury(sev, loc as BodyLocation)}
                >
                  {sev[0].toUpperCase()}-{loc[0]}
                </button>
              ))
            ))}
          </div>
        )}
      </div>

      {/* Rest System */}
      {canEdit && (
        <div>
          <div className="section-header">Rest</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowRestModal('short')}>
              🌙 Short Rest
            </button>
            <button className="btn btn-primary" onClick={() => setShowRestModal('long')}>
              💤 Long Rest
            </button>
          </div>

          {player.lastRestBonus && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
              Last {player.lastRestBonus.restType} rest:
              {' '}{player.lastRestBonus.selectedOptions.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Rest Modal */}
      {showRestModal && (
        <div className="modal-overlay" onClick={() => setShowRestModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {showRestModal === 'long' ? '💤 Long Rest' : '🌙 Short Rest'}
                {' '}— Choose {showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK}
              </span>
              <button className="btn-icon" onClick={() => setShowRestModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {(showRestModal === 'long' ? LONG_REST_OPTIONS : SHORT_REST_OPTIONS).map((opt) => {
                const maxPick = showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK;
                const selected = selectedOptions.includes(opt);
                return (
                  <button
                    key={opt}
                    className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleOption(opt, maxPick)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowRestModal(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={selectedOptions.length < (showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK)}
                onClick={doRest}
              >
                Rest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
