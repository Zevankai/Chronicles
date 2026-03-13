import React, { useState } from 'react';
import { LoreData, LoreCategory, CalendarConfig } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { GMTab } from '../player/GMTab';

interface LoreTokenProps {
  lore: LoreData;
  onUpdate: (updated: LoreData) => void;
  isGM: boolean;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
  playerId?: string | null;
}

const LORE_CATEGORIES: LoreCategory[] = ['Location', 'Object', 'Landmark', 'Historical', 'Organization', 'Other'];

const CATEGORY_ICONS: Record<LoreCategory, string> = {
  Location: '🗺️',
  Object: '🔮',
  Landmark: '🗼',
  Historical: '📚',
  Organization: '⚔️',
  Other: '📜',
};

export function LoreToken({ lore, onUpdate, isGM, calendar, onCalendarChange, onTokenTypeChange, playerId }: LoreTokenProps) {
  const [extendedView, setExtendedView] = useState(false);
  const update = <K extends keyof LoreData>(key: K, value: LoreData[K]) =>
    onUpdate({ ...lore, [key]: value });

  const canViewFull = isGM || lore.revealed;

  const tabs = [
    { id: 'content', label: '📜 Content' },
    ...(isGM ? [{ id: 'gm', label: '🔒 GM' }] : []),
  ];

  const contentPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {isGM && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label className="field-label">Name</label>
              <input type="text" value={lore.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select value={lore.category} onChange={(e) => update('category', e.target.value as LoreCategory)}>
                {LORE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={lore.revealed} onChange={(e) => update('revealed', e.target.checked)} />
            <span className="field-label" style={{ marginBottom: 0 }}>Reveal to Players</span>
          </label>
        </>
      )}
      <div>
        <label className="field-label">Summary</label>
        {isGM ? (
          <textarea value={lore.summary} onChange={(e) => update('summary', e.target.value)} rows={2} />
        ) : (
          <p style={{ fontSize: 13 }}>{lore.summary || 'No information available.'}</p>
        )}
      </div>
      {canViewFull && (
        <div>
          <label className="field-label">Full Description</label>
          {isGM ? (
            <textarea value={lore.fullText} onChange={(e) => update('fullText', e.target.value)} rows={6} />
          ) : (
            <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{lore.fullText}</p>
          )}
        </div>
      )}
      {isGM && (
        <>
          <div>
            <label className="field-label">Tags (comma-separated)</label>
            <input
              type="text"
              value={lore.tags.join(', ')}
              onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className="field-label">GM Notes (Hidden)</label>
            <textarea value={lore.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
          </div>
        </>
      )}

      {/* Claim button */}
      {lore.claimable && !isGM && (
        <div style={{ textAlign: 'center', padding: '8px 0', marginTop: 8 }}>
          {lore.claimedBy ? (
            <div className="badge badge-success" style={{ padding: '6px 12px', display: 'inline-block', fontSize: 12 }}>
              ✅ Claimed {lore.claimedBy === playerId ? '(by you)' : '(by another player)'}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playerId && onUpdate({ ...lore, claimedBy: playerId })}
            >
              🏷 Claim
            </button>
          )}
        </div>
      )}
    </div>
  );

  const gmTokenPanel = (
    <GMTab
      tokenType={lore.tokenType}
      claimable={lore.claimable}
      claimedBy={lore.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...lore, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels: React.ReactNode[] = [contentPanel];
  if (isGM) panels.push(gmTokenPanel);

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {CATEGORY_ICONS[lore.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="token-name">{lore.name}</div>
          <div className="token-subtitle">{lore.category}</div>
          {!lore.revealed && <div className="token-subtitle">🔒 Hidden from players</div>}
        </div>
        <button className="btn-icon" title="Extended View" onClick={() => setExtendedView(true)} style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start' }}>⛶</button>
      </div>
      {extendedView && (
        <div className="modal-overlay" onClick={() => setExtendedView(false)}>
          <div className="modal" style={{ maxWidth: 680, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{CATEGORY_ICONS[lore.category]} {lore.name} — Extended View</span>
              <button className="btn-icon" onClick={() => setExtendedView(false)}>✕</button>
            </div>
            <TabPanel tabs={tabs} defaultTab="content">{panels}</TabPanel>
          </div>
        </div>
      )}
      <TabPanel tabs={tabs} defaultTab="content">{panels}</TabPanel>
    </div>
  );
}
