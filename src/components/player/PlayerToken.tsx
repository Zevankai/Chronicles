import React from 'react';
import { PlayerData, CalendarConfig, WeatherData } from '../../types';
import { TabPanel } from '../common/TabPanel';
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
  calendar?: CalendarConfig;
  weather?: WeatherData;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTradeClick?: () => void;
}

export function PlayerToken({
  player,
  onUpdate,
  isGM,
  isOwner,
  calendar,
  weather,
  onCalendarChange,
  onTradeClick,
}: PlayerTokenProps) {
  const canEdit = isOwner || isGM;

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'skills', label: '🎯 Skills' },
    { id: 'conditions', label: '💔 Conditions' },
    { id: 'character', label: '📜 Character' },
    { id: 'equipment', label: '⚔️ Equipment' },
    { id: 'spells', label: '✨ Spells' },
    { id: 'calendar', label: '📅 Calendar' },
    ...(isGM ? [{ id: 'gm', label: '🔒 GM' }] : []),
  ];

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
        <div>
          <div className="token-name">{player.name || 'Unnamed Character'}</div>
          <div className="token-subtitle">
            {[player.race, player.playerClass, `Level ${player.level}`].filter(Boolean).join(' · ')}
          </div>
          <div className="token-subtitle">
            {player.currentHp}/{player.maxHp} HP · AC {player.ac}
            {player.inspiration && ' · ⭐ Inspired'}
          </div>
        </div>
      </div>

      <TabPanel tabs={tabs} defaultTab="home">
        <HomeTab
          player={player}
          onChange={onUpdate}
          isOwner={isOwner}
          isGM={isGM}
          weather={weather?.description}
          onTradeClick={onTradeClick}
        />
        <SkillsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <ConditionsTab player={player} onChange={onUpdate} canEdit={canEdit} isGM={isGM} />
        <CharacterTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <EquipmentTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <SpellsTab player={player} onChange={onUpdate} canEdit={canEdit} />
        <CalendarTab
          calendar={calendar || {
            months: [],
            daysPerWeek: 7,
            weekDayNames: [],
            yearSuffix: 'DR',
            currentYear: 1492,
            currentMonth: 0,
            currentDay: 1,
            currentHour: 8,
            currentMinute: 0,
          }}
          weather={weather}
          onCalendarChange={onCalendarChange}
          isGM={isGM}
        />
        {isGM && <GMTab player={player} onChange={onUpdate} />}
      </TabPanel>
    </div>
  );
}
