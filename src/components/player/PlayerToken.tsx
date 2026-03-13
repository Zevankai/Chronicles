import React, { useState, useRef } from 'react';
import OBR from '@owlbear-rodeo/sdk';
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
import { FeaturesTab } from './FeaturesTab';

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
  tokenImageUrl?: string | null; // image URL from OBR item
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
  tokenImageUrl,
}: PlayerTokenProps) {
  const canEdit = isOwner || isGM;
  const [editingBanner, setEditingBanner] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onUpdate({ ...player, [key]: value });

  // Determine the avatar image: prefer player.imageUrl, fall back to OBR token image
  const avatarUrl = player.imageUrl || tokenImageUrl || null;
  const zoom = player.imageZoom ?? 1;
  const offsetX = player.imageOffsetX ?? 0;
  const offsetY = player.imageOffsetY ?? 0;

  const handleAvatarClick = () => {
    if (!canEdit) return;
    if (clickTimerRef.current) {
      // Double click: open image editor
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setShowImageEditor(true);
    } else {
      // Single click: toggle inspiration after short delay
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        update('inspiration', !player.inspiration);
      }, 220);
    }
  };

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'skills', label: '🎯 Skills' },
    { id: 'conditions', label: '💔 Cond.' },
    { id: 'character', label: '📜 Char.' },
    { id: 'equipment', label: '⚔️ Equip.' },
    { id: 'spells', label: '✨ Spells' },
    { id: 'features', label: '⭐ Feats' },
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
        {avatarUrl ? (
          <div
            className="token-avatar"
            onClick={handleAvatarClick}
            style={{
              cursor: canEdit ? 'pointer' : 'default',
              overflow: 'hidden',
              border: player.inspiration ? '2px solid var(--color-gold)' : '2px solid rgba(218,165,32,0.4)',
              boxShadow: player.inspiration ? '0 0 8px 3px var(--color-gold)' : undefined,
              position: 'relative',
            }}
            title={canEdit ? 'Click: toggle inspiration · Double-click: edit image' : undefined}
          >
            <img
              src={avatarUrl}
              alt={player.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                transformOrigin: 'center',
              }}
            />
          </div>
        ) : (
          <div
            className="token-avatar"
            onClick={handleAvatarClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              cursor: canEdit ? 'pointer' : 'default',
              boxShadow: player.inspiration ? '0 0 8px 3px var(--color-gold)' : undefined,
              border: player.inspiration ? '2px solid var(--color-gold)' : undefined,
            }}
            title={canEdit ? 'Click: toggle inspiration' : undefined}
          >
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
          onClick={() => {
            if (!itemId) return;
            const base = window.location.href.split('?')[0];
            OBR.popover.open({
              id: 'chronicles-extended',
              url: `${base}?view=extended&itemId=${encodeURIComponent(itemId)}`,
              width: 800,
              height: 700,
            });
          }}
          style={{ fontSize: 14, color: 'white', alignSelf: 'flex-start', marginLeft: 4 }}
        >
          ⛶
        </button>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && canEdit && (
        <div className="modal-overlay" onClick={() => setShowImageEditor(false)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🖼 Image Settings</span>
              <button className="btn-icon" onClick={() => setShowImageEditor(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="field-label">Custom Image URL</label>
                <input
                  type="url"
                  value={player.imageUrl}
                  onChange={(e) => update('imageUrl', e.target.value)}
                  placeholder="Leave empty to use OBR token image"
                />
              </div>
              {avatarUrl && (
                <>
                  <div>
                    <label className="field-label">Zoom ({(zoom * 100).toFixed(0)}%)</label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => update('imageZoom', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="field-label">Offset X ({offsetX}px)</label>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={offsetX}
                        onChange={(e) => update('imageOffsetX', parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="field-label">Offset Y ({offsetY}px)</label>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={offsetY}
                        onChange={(e) => update('imageOffsetY', parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-gold)' }}>
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                          transformOrigin: 'center',
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onUpdate({ ...player, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0 })}
                  >
                    Reset Zoom/Offset
                  </button>
                </>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => setShowImageEditor(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* HP Bar in header area — display only, not editable here */}
      <div style={{ padding: '4px 8px', background: 'var(--color-primary)' }}>
        <HPBar
          current={player.currentHp}
          max={player.maxHp}
          temp={player.tempHp}
          editable={false}
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
          playerId={playerId}
        />
        <SkillsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <ConditionsTab player={player} onChange={onUpdate} canEdit={canEdit} isGM={isGM} />
        <CharacterTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <EquipmentTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <SpellsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <FeaturesTab player={player} onChange={onUpdate} canEdit={canEdit} />
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
              {/* Inspiration */}
              <div>
                <div className="section-header">Inspiration</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={player.inspiration}
                    onChange={(e) => update('inspiration', e.target.checked)}
                  />
                  <span style={{ fontSize: 13 }}>Inspired</span>
                </label>
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
