import React, { useState } from 'react';
import { PlayerData, Injury, InjurySeverity, BodyLocation, Scar, Project } from '../../types';
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

// Rest activity descriptions
const SHORT_REST_DESCRIPTIONS: Record<string, { description: string; effect: string }> = {
  'Eat': {
    description: 'Eat some food from your pack. (must eat at least once per day)',
    effect: 'When you spend hit dice during this rest, add +1d6 HP.',
  },
  'Stretch': {
    description: 'Loosen muscles and limber up.',
    effect: 'Gain +2 to your next two Strength or Dexterity checks.',
  },
  'Meditate': {
    description: 'Meditate briefly or recall training.',
    effect: 'Advantage on 1 skill check or saving throw of your choice.',
  },
  'Sharpen': {
    description: 'Hone weapons or practice with a ranged weapon.',
    effect: 'Gain +1 to your next two attack rolls.',
  },
  'Scout': {
    description: 'Take some time to observe your surroundings or maps.',
    effect: 'Gain advantage on a Perception, Investigation, Survival, or Navigation check of your choice.',
  },
  'Motivate': {
    description: 'Encourage or coach a companion.',
    effect: 'Grant one ally +1d8 temporary HP.',
  },
  'Bond': {
    description: 'Share a quick moment of teamwork.',
    effect: 'The next time you use the Help action for an ally who bonds with you during this rest, the assisted roll gains advantage AND a +2 bonus.',
  },
  'Tinker': {
    description: 'Fix gear, traps, or mechanical objects.',
    effect: 'Repair, modify, or create a small item or tool.',
  },
  'Study': {
    description: 'Review a skill, spell, or tool briefly.',
    effect: 'Choose a skill and gain advantage on one roll of your choice.',
  },
  'Calm': {
    description: 'Take a deep breath, meditate, or shake off stress.',
    effect: 'End one of the following conditions: frightened, poisoned, or exhausted (1 level only).',
  },
  'Tell a Joke': {
    description: 'Share a joke, funny story, or embarrassing tale from your travels.',
    effect: 'If the table laughs, you or one ally of your choice gains Inspiration. (GM decides if laughs are genuine)',
  },
};

const LONG_REST_DESCRIPTIONS: Record<string, { description: string; effect: string }> = {
  'Eat': {
    description: 'Consume a food item from your pack. (must eat at least once per day)',
    effect: '+1 to your next 3 constitution rolls.',
  },
  'Pray': {
    description: 'Spend time in meditation or prayer.',
    effect: 'Gain advantage on a skill check of your choice for the next day.',
  },
  'Study': {
    description: 'Focus on practicing or reviewing a skill or tool.',
    effect: '+1 bonus to checks using a chosen skill or tool for the next day.',
  },
  'Work': {
    description: 'Work on a passion project.',
    effect: 'Progress a project by 1 point.',
  },
  'Spar': {
    description: 'Train or spar with another player to prepare for combat.',
    effect: 'Gain advantage on initiative rolls for the next day (can include one other willing character).',
  },
  'Reinforce': {
    description: 'Rest and focus on physical conditioning.',
    effect: 'Gain 1d8 + proficiency bonus temporary hit points.',
  },
  'Bond': {
    description: 'Spend time strengthening your teamwork.',
    effect: 'Gain +2 to the next day\'s rolls when collaborating with another player who chooses to also bond with you during this rest.',
  },
  'Craft': {
    description: 'Use tools and skill to craft items.',
    effect: 'Craft two mundane items (arrows, bolts, rations, etc.) provided you have the skills and materials.',
  },
  'Scout': {
    description: 'Review maps and survey the surrounding area.',
    effect: 'Gain advantage on navigation and survival checks in this biome for the next day.',
  },
  'Care': {
    description: 'Tend to your companion\'s needs, improving its performance.',
    effect: 'Grant advantage on all rolls for your animal companion or summoned creature for the next day.',
  },
  'Tell a Joke': {
    description: 'Share a joke, funny story, or embarrassing tale from your travels.',
    effect: 'If the table laughs, you or one ally of your choice gains Inspiration. (GM decides if laughs are genuine)',
  },
};

export function ConditionsTab({ player, onChange, canEdit, isGM }: ConditionsTabProps) {
  const [showRestModal, setShowRestModal] = useState<'long' | 'short' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedOptionDesc, setSelectedOptionDesc] = useState<string | null>(null);
  const [scarPrompt, setScarPrompt] = useState<{ injuryId: string; severity: InjurySeverity; location: BodyLocation } | null>(null);
  const [scarDesc, setScarDesc] = useState('');
  const [showWorkProjectPicker, setShowWorkProjectPicker] = useState(false);
  const [recentShortExpanded, setRecentShortExpanded] = useState<string | null>(null);
  const [recentLongExpanded, setRecentLongExpanded] = useState<string | null>(null);

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

    // If long rest includes Work, show project picker
    if (showRestModal === 'long' && selectedOptions.includes('Work')) {
      const projects = player.projects || [];
      if (projects.length > 0 && !showWorkProjectPicker) {
        setShowWorkProjectPicker(true);
        return;
      }
    }

    const restBonus = {
      restType: showRestModal as 'long' | 'short',
      selectedOptions,
      details: {},
      used: [],
      timestamp: Date.now(),
    };

    let updates: Partial<PlayerData> = {};
    if (showRestModal === 'long') {
      updates = {
        currentHp: player.maxHp,
        exhaustionLevel: Math.max(0, player.exhaustionLevel - 1),
        spellSlots: Object.fromEntries(
          Object.entries(player.spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
        ) as PlayerData['spellSlots'],
        lastRestBonus: restBonus,
        lastLongRestBonus: restBonus,
      };
    } else {
      const healAmount = Math.floor(player.maxHp * 0.25);
      updates = {
        currentHp: Math.min(player.maxHp, player.currentHp + healAmount),
        lastRestBonus: restBonus,
        lastShortRestBonus: restBonus,
      };
    }

    const restHealAmount = showRestModal === 'long' ? 2 : 1;

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
        break;
      }
    }

    onChange({ ...merged, injuries: injuriesUpdated });
    setShowRestModal(null);
    setSelectedOptions([]);
    setSelectedOptionDesc(null);
    setShowWorkProjectPicker(false);
  };

  const handleWorkProjectSelect = (projectId: string) => {
    const projects = player.projects || [];
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, progressPoints: p.progressPoints + 1 } : p
    );
    onChange({ ...player, projects: updated });
    setShowWorkProjectPicker(false);
    // Continue with rest after project selection
    doRestAfterWork();
  };

  const doRestAfterWork = () => {
    const restBonus = {
      restType: 'long' as const,
      selectedOptions,
      details: {},
      used: [],
      timestamp: Date.now(),
    };
    const updates: Partial<PlayerData> = {
      currentHp: player.maxHp,
      exhaustionLevel: Math.max(0, player.exhaustionLevel - 1),
      spellSlots: Object.fromEntries(
        Object.entries(player.spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
      ) as PlayerData['spellSlots'],
      lastRestBonus: restBonus,
      lastLongRestBonus: restBonus,
    };
    const merged: PlayerData = { ...player, ...updates };
    const sevOrder: InjurySeverity[] = ['critical', 'severe', 'minor'];
    const active = merged.injuries.filter((i) => !i.healed);
    let injuriesUpdated = merged.injuries;
    for (const sev of sevOrder) {
      const inj = active.find((i) => i.severity === sev);
      if (inj) {
        const newHp = Math.max(0, (inj.currentHp ?? inj.maxHp) - 2);
        injuriesUpdated = merged.injuries.map((i) =>
          i.id === inj.id ? { ...i, currentHp: newHp, healed: newHp === 0 } : i
        );
        break;
      }
    }
    onChange({ ...merged, injuries: injuriesUpdated });
    setShowRestModal(null);
    setSelectedOptions([]);
    setSelectedOptionDesc(null);
  };

  const toggleOption = (opt: string, maxPick: number) => {
    if (selectedOptions.includes(opt)) {
      setSelectedOptions(selectedOptions.filter((x) => x !== opt));
      if (selectedOptionDesc === opt) setSelectedOptionDesc(null);
    } else if (selectedOptions.length < maxPick) {
      setSelectedOptions([...selectedOptions, opt]);
      setSelectedOptionDesc(opt);
    } else {
      // Already at max — just show description
      setSelectedOptionDesc(opt);
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
            <button className="btn btn-secondary" onClick={() => { setShowRestModal('short'); setSelectedOptions([]); setSelectedOptionDesc(null); }}>
              🌙 Short Rest
            </button>
            <button className="btn btn-primary" onClick={() => { setShowRestModal('long'); setSelectedOptions([]); setSelectedOptionDesc(null); }}>
              💤 Long Rest
            </button>
          </div>

          {/* Recent rest choices */}
          {(player.lastShortRestBonus || player.lastLongRestBonus) && (
            <div style={{ marginTop: 8 }}>
              {player.lastShortRestBonus && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 'bold', marginBottom: 4 }}>
                    Last Short Rest:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {player.lastShortRestBonus.selectedOptions.map((opt) => {
                      const isUsed = (player.lastShortRestBonus!.used || []).includes(opt);
                      const isExpanded = recentShortExpanded === opt;
                      const desc = SHORT_REST_DESCRIPTIONS[opt];
                      return (
                        <div key={opt} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              className={`btn btn-sm ${isUsed ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ opacity: isUsed ? 0.6 : 1, fontSize: 11 }}
                              onClick={() => setRecentShortExpanded(isExpanded ? null : opt)}
                            >
                              {opt}
                            </button>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', fontSize: 11 }}>
                              <input
                                type="checkbox"
                                checked={isUsed}
                                onChange={(e) => {
                                  const used = player.lastShortRestBonus!.used || [];
                                  update('lastShortRestBonus', {
                                    ...player.lastShortRestBonus!,
                                    used: e.target.checked ? [...used, opt] : used.filter((u) => u !== opt),
                                  });
                                }}
                              />
                              Used
                            </label>
                          </div>
                          {isExpanded && desc && (
                            <div style={{
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border-light)',
                              borderRadius: 4,
                              padding: '6px 8px',
                              fontSize: 11,
                              marginTop: 4,
                              marginLeft: 4,
                            }}>
                              <div style={{ color: 'var(--color-text-muted)' }}>{desc.description}</div>
                              <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                                <strong>Effect:</strong> {desc.effect}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {player.lastLongRestBonus && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 'bold', marginBottom: 4 }}>
                    Last Long Rest:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {player.lastLongRestBonus.selectedOptions.map((opt) => {
                      const isUsed = (player.lastLongRestBonus!.used || []).includes(opt);
                      const isExpanded = recentLongExpanded === opt;
                      const desc = LONG_REST_DESCRIPTIONS[opt];
                      return (
                        <div key={opt} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              className={`btn btn-sm ${isUsed ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ opacity: isUsed ? 0.6 : 1, fontSize: 11 }}
                              onClick={() => setRecentLongExpanded(isExpanded ? null : opt)}
                            >
                              {opt}
                            </button>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', fontSize: 11 }}>
                              <input
                                type="checkbox"
                                checked={isUsed}
                                onChange={(e) => {
                                  const used = player.lastLongRestBonus!.used || [];
                                  update('lastLongRestBonus', {
                                    ...player.lastLongRestBonus!,
                                    used: e.target.checked ? [...used, opt] : used.filter((u) => u !== opt),
                                  });
                                }}
                              />
                              Used
                            </label>
                          </div>
                          {isExpanded && desc && (
                            <div style={{
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border-light)',
                              borderRadius: 4,
                              padding: '6px 8px',
                              fontSize: 11,
                              marginTop: 4,
                              marginLeft: 4,
                            }}>
                              <div style={{ color: 'var(--color-text-muted)' }}>{desc.description}</div>
                              <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                                <strong>Effect:</strong> {desc.effect}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rest Modal */}
      {showRestModal && (
        <div className="modal-overlay" onClick={() => { setShowRestModal(null); setSelectedOptions([]); setSelectedOptionDesc(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {showRestModal === 'long' ? '💤 Long Rest' : '🌙 Short Rest'}
                {' '}— Choose {showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK}
              </span>
              <button className="btn-icon" onClick={() => { setShowRestModal(null); setSelectedOptions([]); setSelectedOptionDesc(null); }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(showRestModal === 'long' ? LONG_REST_OPTIONS : SHORT_REST_OPTIONS).map((opt) => {
                const maxPick = showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK;
                const selected = selectedOptions.includes(opt);
                const isDescShowing = selectedOptionDesc === opt;
                const descriptions = showRestModal === 'long' ? LONG_REST_DESCRIPTIONS : SHORT_REST_DESCRIPTIONS;
                const desc = descriptions[opt];
                return (
                  <div key={opt} style={{ width: '100%' }}>
                    <button
                      className={`btn ${selected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => toggleOption(opt, maxPick)}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      {selected ? '✓ ' : ''}{opt}
                    </button>
                    {isDescShowing && desc && (
                      <div style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontSize: 11,
                        marginTop: 3,
                      }}>
                        <div style={{ color: 'var(--color-text-muted)' }}>{desc.description}</div>
                        <div style={{ color: 'var(--color-success)', marginTop: 4 }}>
                          <strong>Effect:</strong> {desc.effect}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setShowRestModal(null); setSelectedOptions([]); setSelectedOptionDesc(null); }}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={selectedOptions.length < (showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK)}
                onClick={doRest}
              >
                Rest ({selectedOptions.length}/{showRestModal === 'long' ? LONG_REST_PICK : SHORT_REST_PICK})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work project picker */}
      {showWorkProjectPicker && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🔨 Work — Choose a Project</span>
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
              Which project do you want to work on? (+1 progress point)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(player.projects || []).map((project) => {
                const pct = project.totalPoints > 0 ? Math.min(100, (project.progressPoints / project.totalPoints) * 100) : 0;
                return (
                  <button
                    key={project.id}
                    className="btn btn-secondary"
                    style={{ textAlign: 'left' }}
                    onClick={() => handleWorkProjectSelect(project.id)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{project.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {project.progressPoints}/{project.totalPoints} pts ({pct.toFixed(0)}%)
                    </div>
                  </button>
                );
              })}
              {(player.projects || []).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No projects found. Add projects in the Character tab.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => { setShowWorkProjectPicker(false); doRestAfterWork(); }}>Skip</button>
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
