import React, { useState } from 'react';
import { PlayerData, CalendarConfig, WeatherData } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { HPBar } from '../common/HPBar';
import { HomeTab } from './HomeTab';
import { SkillsTab } from './SkillsTab';
import { ConditionsTab } from './ConditionsTab';
import { CharacterTab } from './CharacterTab';
import { EquipmentTab } from './EquipmentTab';
import { SpellsTab } from './SpellsTab';
import { CalendarTab } from './CalendarTab';
import { GMTab } from './GMTab';

interface PlayerTokenProps {
  player: PlayerData;
  onUpdate: (updated: PlayerData) => void;
  isGM: boolean;
  isOwner: boolean;
  playerId?: string | null;
  calendar?: CalendarConfig;
  weather?: WeatherData;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onWeatherChange?: (w: WeatherData) => void;
  onTradeClick?: () => void;
  itemId?: string; // OBR item ID for this token
}

export function PlayerToken({
  player,
  onUpdate,
  isGM,
  isOwner,
  playerId,
  calendar,
  weather,
  onCalendarChange,
  onWeatherChange,
  onTradeClick,
  itemId,
}: PlayerTokenProps) {
  const canEdit = isOwner || isGM;
  const [editingBanner, setEditingBanner] = useState(false);
  const [extendedView, setExtendedView] = useState(false);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onUpdate({ ...player, [key]: value });

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'skills', label: '🎯 Skills' },
    { id: 'conditions', label: '💔 Cond.' },
    { id: 'character', label: '📜 Char.' },
    { id: 'equipment', label: '⚔️ Equip.' },
    { id: 'spells', label: '✨ Spells' },
    { id: 'calendar', label: '📅 Cal.' },
    { id: 'gm', label: '🔒 GM' },
  ];

  const cal: CalendarConfig = calendar || {
    months: [],
    daysPerWeek: 7,
    weekDayNames: [],
    yearSuffix: 'DR',
    currentYear: 1492,
    currentMonth: 0,
    currentDay: 1,
    currentHour: 8,
    currentMinute: 0,
  };

  return (
    <div>
      {/* Header */}
      <div className="token-header">
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="token-avatar" />
        ) : (
          <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            👤
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {canEdit && editingBanner ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }} onClick={(e) => e.stopPropagation()}>
              <input
                className="banner-input"
                type="text"
                value={player.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Name"
                style={{ fontSize: 14, fontWeight: 'bold', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: 3, padding: '2px 5px' }}
              />
              <div style={{ display: 'flex', gap: 3 }}>
                <input
                  className="banner-input"
                  type="text"
                  value={player.race}
                  onChange={(e) => update('race', e.target.value)}
                  placeholder="Race"
                  style={{ flex: 1, fontSize: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 3, padding: '1px 4px' }}
                />
                <input
                  className="banner-input"
                  type="text"
                  value={player.playerClass}
                  onChange={(e) => update('playerClass', e.target.value)}
                  placeholder="Class"
                  style={{ flex: 1, fontSize: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 3, padding: '1px 4px' }}
                />
                <input
                  className="banner-input"
                  type="number"
                  value={player.level}
                  onChange={(e) => update('level', parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                  placeholder="Lv"
                  style={{ width: 36, fontSize: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 3, padding: '1px 4px' }}
                />
              </div>
              <button
                className="btn btn-sm"
                onClick={() => setEditingBanner(false)}
                style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontSize: 10, padding: '1px 6px' }}
              >
                Done
              </button>
            </div>
          ) : (
            <div onClick={() => canEdit && setEditingBanner(true)} style={{ cursor: canEdit ? 'pointer' : 'default' }} title={canEdit ? 'Click to edit' : undefined}>
              <div className="token-name">{player.name || 'Unnamed Character'}</div>
              <div className="token-subtitle">
                {[player.race, player.playerClass, player.level ? `Level ${player.level}` : ''].filter(Boolean).join(' · ')}
              </div>
              <div className="token-subtitle">
                AC {player.ac}
                {player.inspiration && ' · ⭐ Inspired'}
              </div>
            </div>
          )}
        </div>
        <button
          className="btn-icon"
          title="Extended View"
          onClick={() => setExtendedView(true)}
          style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start', marginLeft: 4 }}
        >
          ⛶
        </button>
      </div>

      {/* Extended View Modal */}
      {extendedView && (
        <div className="modal-overlay" onClick={() => setExtendedView(false)}>
          <div
            className="modal"
            style={{ maxWidth: 680, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">👤 {player.name} — Extended View</span>
              <button className="btn-icon" onClick={() => setExtendedView(false)}>✕</button>
            </div>
            <TabPanel tabs={tabs} defaultTab="home" twoRows>
              <HomeTab player={player} onChange={onUpdate} isOwner={isOwner} isGM={isGM} weather={weather?.description} onTradeClick={onTradeClick} currentTokenId={itemId} playerId={playerId} />
              <SkillsTab player={player} onChange={onUpdate} canEdit={canEdit} />
              <ConditionsTab player={player} onChange={onUpdate} canEdit={canEdit} isGM={isGM} />
              <CharacterTab player={player} onChange={onUpdate} canEdit={canEdit} />
              <EquipmentTab player={player} onChange={onUpdate} canEdit={canEdit} />
              <SpellsTab player={player} onChange={onUpdate} canEdit={canEdit} />
              <CalendarTab calendar={cal} weather={weather} onCalendarChange={onCalendarChange} onWeatherChange={onWeatherChange} isGM={isGM} />
              <GMTab tokenType={player.tokenType} claimable={player.claimable} claimedBy={player.claimedBy} onTokenTypeChange={(tt) => onUpdate({ ...player, tokenType: tt as PlayerData['tokenType'] })} onClaimableChange={(v) => onUpdate({ ...player, claimable: v })} calendar={cal} onCalendarChange={onCalendarChange} isGM={isGM} tokenData={player} />
            </TabPanel>
          </div>
        </div>
      )}

      {/* HP Bar in header area */}
      <div style={{ padding: '4px 8px', background: 'var(--color-primary)' }}>
        <HPBar
          current={player.currentHp}
          max={player.maxHp}
          temp={player.tempHp}
          editable={canEdit}
          onCurrentChange={(v) => update('currentHp', v)}
          onTempChange={(v) => update('tempHp', v)}
        />
      </div>

      <TabPanel tabs={tabs} defaultTab="home" twoRows>
        <HomeTab
          player={player}
          onChange={onUpdate}
          isOwner={isOwner}
          isGM={isGM}
          weather={weather?.description}
          onTradeClick={onTradeClick}
          currentTokenId={itemId}
          playerId={playerId}
        />
        <SkillsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <ConditionsTab player={player} onChange={onUpdate} canEdit={canEdit} isGM={isGM} />
        <CharacterTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <EquipmentTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <SpellsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <CalendarTab
          calendar={cal}
          weather={weather}
          onCalendarChange={onCalendarChange}
          onWeatherChange={onWeatherChange}
          isGM={isGM}
        />
        <GMTab
          tokenType={player.tokenType}
          claimable={player.claimable}
          claimedBy={player.claimedBy}
          onTokenTypeChange={(tt) => onUpdate({ ...player, tokenType: tt as PlayerData['tokenType'] })}
          onClaimableChange={(v) => onUpdate({ ...player, claimable: v })}
          calendar={cal}
          onCalendarChange={onCalendarChange}
          isGM={isGM}
          tokenData={player}
          extraContent={
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
                  rows={4}
                  placeholder="Private notes visible only to GM..."
                />
              </div>
            </div>
          }
        />
      </TabPanel>
    </div>
  );
}
