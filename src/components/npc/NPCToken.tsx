import React from 'react';
import { NPCData, Alignment, CalendarConfig } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { GMTab } from '../player/GMTab';
import { ALIGNMENTS } from '../../constants';
import { generateId } from '../../utils';

interface NPCTokenProps {
  npc: NPCData;
  onUpdate: (updated: NPCData) => void;
  isGM: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
}

export function NPCToken({ npc, onUpdate, isGM, calendar, onCalendarChange, onTokenTypeChange }: NPCTokenProps) {
  const update = <K extends keyof NPCData>(key: K, value: NPCData[K]) =>
    onUpdate({ ...npc, [key]: value });

  const canViewField = (field: string) => isGM || npc.revealedFields.includes(field);

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'narrative', label: '📜 Narrative' },
    { id: 'relations', label: '🤝 Relations' },
    ...(isGM ? [{ id: 'secrets', label: '🔒 Secrets' }, { id: 'gm', label: '⚙️ GM' }] : []),
  ];

  const profilePanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {isGM && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={npc.revealed} onChange={(e) => update('revealed', e.target.checked)} />
          <span className="field-label" style={{ marginBottom: 0 }}>Reveal NPC to Players</span>
        </label>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Name</label>
          {isGM ? (
            <input type="text" value={npc.name} onChange={(e) => update('name', e.target.value)} />
          ) : <p style={{ fontSize: 13 }}>{npc.name}</p>}
        </div>
        <div>
          <label className="field-label">Title</label>
          {isGM ? (
            <input type="text" value={npc.title || ''} onChange={(e) => update('title', e.target.value)} />
          ) : <p style={{ fontSize: 13 }}>{npc.title}</p>}
        </div>
        <div>
          <label className="field-label">Race</label>
          {isGM ? (
            <input type="text" value={npc.race} onChange={(e) => update('race', e.target.value)} />
          ) : <p style={{ fontSize: 13 }}>{npc.race}</p>}
        </div>
        <div>
          <label className="field-label">Alignment</label>
          {isGM ? (
            <select value={npc.alignment} onChange={(e) => update('alignment', e.target.value as Alignment)}>
              {ALIGNMENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          ) : <p style={{ fontSize: 13 }}>{npc.alignment}</p>}
        </div>
        <div>
          <label className="field-label">Occupation</label>
          {isGM ? (
            <input type="text" value={npc.occupation} onChange={(e) => update('occupation', e.target.value)} />
          ) : canViewField('occupation') ? <p style={{ fontSize: 13 }}>{npc.occupation}</p> : null}
        </div>
        <div>
          <label className="field-label">Location</label>
          {isGM ? (
            <input type="text" value={npc.location} onChange={(e) => update('location', e.target.value)} />
          ) : canViewField('location') ? <p style={{ fontSize: 13 }}>{npc.location}</p> : null}
        </div>
      </div>
      {canViewField('appearance') && (
        <div>
          <label className="field-label">Appearance</label>
          {isGM ? (
            <textarea value={npc.appearance} onChange={(e) => update('appearance', e.target.value)} rows={2} />
          ) : <p style={{ fontSize: 13 }}>{npc.appearance}</p>}
        </div>
      )}
    </div>
  );

  const narrativePanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {canViewField('personality') && (
        <div>
          <label className="field-label">Personality</label>
          {isGM ? (
            <textarea value={npc.personality} onChange={(e) => update('personality', e.target.value)} rows={3} />
          ) : <p style={{ fontSize: 13 }}>{npc.personality}</p>}
        </div>
      )}
      {canViewField('background') && (
        <div>
          <label className="field-label">Background</label>
          {isGM ? (
            <textarea value={npc.background} onChange={(e) => update('background', e.target.value)} rows={3} />
          ) : <p style={{ fontSize: 13 }}>{npc.background}</p>}
        </div>
      )}
      {isGM && (
        <div>
          <label className="field-label">Motivations (GM Only)</label>
          <textarea value={npc.motivations} onChange={(e) => update('motivations', e.target.value)} rows={2} />
        </div>
      )}
    </div>
  );

  const relationsPanel = (
    <div>
      <div className="section-header">Relationships</div>
      {npc.relationships.map((rel) => (
        <div key={rel.targetId} style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 4,
          padding: 6,
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 12 }}>{rel.targetName}</strong>
            <span className="badge badge-info">{rel.relationship}</span>
          </div>
          {rel.notes && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{rel.notes}</div>}
          {isGM && (
            <button className="btn-icon" onClick={() => update('relationships', npc.relationships.filter((r) => r.targetId !== rel.targetId))}>🗑</button>
          )}
        </div>
      ))}
      {isGM && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const name = prompt('NPC/character name:');
          if (!name) return;
          const rel = prompt('Relationship type (ally, rival, etc.):') || 'ally';
          update('relationships', [...npc.relationships, {
            targetId: generateId(),
            targetName: name,
            relationship: rel,
            notes: '',
          }]);
        }}>+ Add Relationship</button>
      )}

      <div className="divider" />
      <div className="section-header">Active Quests</div>
      {npc.quests.map((quest, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 12 }}>{quest}</span>
          {isGM && (
            <button className="btn-icon" onClick={() => update('quests', npc.quests.filter((_, qi) => qi !== i))}>🗑</button>
          )}
        </div>
      ))}
      {isGM && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const q = prompt('Quest description:');
          if (q) update('quests', [...npc.quests, q]);
        }}>+ Add Quest</button>
      )}
    </div>
  );

  const gmPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <label className="field-label">Secrets (GM Only)</label>
        <textarea value={npc.secrets} onChange={(e) => update('secrets', e.target.value)} rows={4} />
      </div>
      <div>
        <label className="field-label">Notes</label>
        <textarea value={npc.notes} onChange={(e) => update('notes', e.target.value)} rows={4} />
      </div>
      <div>
        <div className="section-header">Revealed Fields</div>
        {['occupation', 'location', 'appearance', 'personality', 'background'].map((field) => (
          <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={npc.revealedFields.includes(field)}
              onChange={(e) => update('revealedFields',
                e.target.checked
                  ? [...npc.revealedFields, field]
                  : npc.revealedFields.filter((f) => f !== field)
              )}
            />
            <span style={{ fontSize: 13 }}>{field}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const gmTokenPanel = (
    <GMTab
      tokenType={npc.tokenType}
      claimable={npc.claimable}
      claimedBy={npc.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...npc, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels = [profilePanel, narrativePanel, relationsPanel];
  if (isGM) { panels.push(gmPanel); panels.push(gmTokenPanel); }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧙</div>
        <div>
          <div className="token-name">{npc.name}</div>
          <div className="token-subtitle">{[npc.title, npc.race, npc.occupation].filter(Boolean).join(' · ')}</div>
          {!npc.revealed && <div className="token-subtitle">🔒 Hidden</div>}
        </div>
      </div>
      <TabPanel tabs={tabs} defaultTab="profile">{panels}</TabPanel>
    </div>
  );
}
