import React, { useState } from 'react';
import { PlayerData, Injury, InjurySeverity, BodyLocation, Scar } from '../../types';
import { ConditionGrid } from '../common/ConditionBadge';
import { ExhaustionBar } from '../common/ExhaustionBar';
import { DEFAULT_EXHAUSTION_EFFECTS, LONG_REST_OPTIONS, SHORT_REST_OPTIONS, LONG_REST_PICK, SHORT_REST_PICK } from '../../constants';
import { generateId, getInjuryMaxHp } from '../../utils';

interface ConditionsTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
  isGM: boolean;
}

export function ConditionsTab({ player, onChange, canEdit, isGM }: ConditionsTabProps) {
  const [showRestModal, setShowRestModal] = useState<'long' | 'short' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [scarPrompt, setScarPrompt] = useState<{ injuryId: string; severity: InjurySeverity; location: BodyLocation } | null>(null);
  const [scarDesc, setScarDesc] = useState('');

  const exhaustionConfig = (player.exhaustionConfig?.length ? player.exhaustionConfig : DEFAULT_EXHAUSTION_EFFECTS);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const addInjury = (severity: InjurySeverity, location: BodyLocation) => {
    const maxHp = getInjuryMaxHp(severity);
    const injury: Injury = {
      id: generateId(),
      severity,
      location,
      description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${location} injury`,
      currentHp: maxHp,
      maxHp,
      healed: false,
      timestamp: Date.now(),
    };
    update('injuries', [...player.injuries, injury]);
  };

  const healInjuryHp = (id: string, amount: number) => {
    const injury = player.injuries.find((i) => i.id === id);
    if (!injury) return;
    const newHp = Math.max(0, (injury.currentHp ?? injury.maxHp) - amount);
    if (newHp === 0) {
      // Injury fully healed — prompt for scar if severe/critical
      if (injury.severity === 'severe' || injury.severity === 'critical') {
        setScarPrompt({ injuryId: id, severity: injury.severity, location: injury.location });
        setScarDesc('');
      } else {
        // Minor — just heal
        onChange({
          ...player,
          injuries: player.injuries.map((i) => i.id === id ? { ...i, currentHp: 0, healed: true } : i),
        });
      }
    } else {
      onChange({
        ...player,
        injuries: player.injuries.map((i) => i.id === id ? { ...i, currentHp: newHp } : i),
      });
    }
  };

  const confirmScar = () => {
    if (!scarPrompt) return;
    const scar: Scar = {
      id: generateId(),
      description: scarDesc || `Healed ${scarPrompt.severity} ${scarPrompt.location} injury`,
      fromInjuryId: scarPrompt.injuryId,
      severity: scarPrompt.severity,
      location: scarPrompt.location,
    };
    onChange({
      ...player,
      injuries: player.injuries.map((i) =>
        i.id === scarPrompt.injuryId ? { ...i, currentHp: 0, healed: true, scarDescription: scarDesc } : i
      ),
      scars: [...(player.scars || []), scar],
    });
    setScarPrompt(null);
    setScarDesc('');
  };

  // Heal the most severe active injury
  // (used by rest system inline)

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

    const restHealAmount = showRestModal === 'long' ? 2 : 1;

    // We need to also heal injuries; do this after applying updates
    const merged: PlayerData = { ...player, ...updates };

    // Heal most severe injury
    const sevOrder: InjurySeverity[] = ['critical', 'severe', 'minor'];
    const active = merged.injuries.filter((i) => !i.healed);
    let injuriesUpdated = merged.injuries;
    for (const sev of sevOrder) {
      const inj = active.find((i) => i.severity === sev);
      if (inj) {
        const newHp = Math.max(0, (inj.currentHp ?? inj.maxHp) - restHealAmount);
        injuriesUpdated = merged.injuries.map((i) =>
          i.id === inj.id ? { ...i, currentHp: newHp, healed: newHp === 0 } : i
        );
        // If healed and needs scar, we'll just mark healed; scar prompt would need a follow-up
        break;
      }
    }

    onChange({ ...merged, injuries: injuriesUpdated });
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

  const activeInjuries = player.injuries.filter((i) => !i.healed);

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
        {activeInjuries.map((injury) => {
          const maxHp = injury.maxHp || getInjuryMaxHp(injury.severity);
          const curHp = injury.currentHp ?? maxHp;
          const pct = maxHp > 0 ? (curHp / maxHp) * 100 : 0;
          return (
            <div key={injury.id} className={`injury-card ${injury.severity}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{injury.severity.toUpperCase()}</strong> — {injury.location}
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{injury.description}</div>
                  {injury.severity === 'severe' && (
                    <div style={{ fontSize: 10, color: 'var(--color-warning)' }}>
                      {injury.location === 'Limb' ? 'DIS on DEX rolls' : injury.location === 'Torso' ? 'DIS on STR rolls' : 'DIS on CON, WIS & INT rolls'}
                    </div>
                  )}
                  {injury.severity === 'critical' && (
                    <div style={{ fontSize: 10, color: 'var(--color-danger)' }}>DIS on attack rolls and all saves</div>
                  )}
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button className="btn btn-sm btn-success" onClick={() => healInjuryHp(injury.id, 1)}>
                      Heal 1
                    </button>
                  </div>
                )}
              </div>
              {/* Injury HP bar */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  Healing: {curHp}/{maxHp} HP remaining
                </div>
                <div style={{ height: 6, background: 'var(--color-surface-dark)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: injury.severity === 'critical' ? 'var(--color-danger)' : injury.severity === 'severe' ? 'var(--color-warning)' : 'var(--color-success)',
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
        {activeInjuries.length === 0 && (
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
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            Short rest heals most severe injury by 1 HP. Long rest heals it by 2 HP.
          </div>
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
              Last {player.lastRestBonus.restType} rest:{' '}
              {player.lastRestBonus.selectedOptions.join(', ')}
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

      {/* Scar prompt when injury fully heals */}
      {scarPrompt && (
        <div className="modal-overlay" onClick={() => confirmScar()}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">⚔️ Scar Acquired</span>
            </div>
            <div style={{ marginBottom: 12, fontSize: 13 }}>
              Your <strong>{scarPrompt.severity}</strong> {scarPrompt.location} injury has fully healed, leaving a permanent scar.
              Describe what it looks like:
            </div>
            <textarea
              value={scarDesc}
              onChange={(e) => setScarDesc(e.target.value)}
              placeholder="A jagged scar running across the..."
              rows={3}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => { setScarPrompt(null); }}>Skip</button>
              <button className="btn btn-primary" onClick={confirmScar}>Save Scar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
