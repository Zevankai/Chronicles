import React, { useState } from 'react';
import { AnyTokenData, PlayerData, MonsterData, CompanionData, StorageData, LoreData, NPCData, MerchantData, RoomMetadata, CalendarConfig, WeatherData } from '../types';
import { PlayerToken } from './player';
import { MonsterToken } from './monster';
import { CompanionToken } from './companion';
import { StorageToken } from './storage';
import { LoreToken } from './lore';
import { NPCToken } from './npc';
import { MerchantToken } from './merchant';
import { TradeSelector } from './trading/TradeSelector';
import { createDefaultPlayerData, createDefaultMonsterData } from '../utils';

interface TokenSelectorProps {
  itemId: string;
  data: AnyTokenData | null;
  onUpdate: (data: AnyTokenData) => void;
  isGM: boolean;
  playerId: string | null;
  roomData: RoomMetadata | null;
  onRoomUpdate?: (data: RoomMetadata) => void;
}

function NoTokenData({ itemId, isGM, onUpdate }: { itemId: string; isGM: boolean; onUpdate: (data: AnyTokenData) => void }) {
  if (!isGM) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📜</div>
          <div>No Chronicles data for this token.</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
            GM must assign a token type.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div className="section-header">Assign Token Type</div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        This token has no Chronicles data. Choose a type to get started:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { type: 'player', icon: '👤', label: 'Player Character' },
          { type: 'monster', icon: '👹', label: 'Monster / NPC Combat' },
          { type: 'companion', icon: '🐾', label: 'Animal Companion' },
          { type: 'storage', icon: '📦', label: 'Storage Container' },
          { type: 'lore', icon: '📜', label: 'Lore Token' },
          { type: 'npc', icon: '🧙', label: 'NPC' },
          { type: 'merchant', icon: '🏪', label: 'Merchant / Shop' },
        ].map(({ type, icon, label }) => (
          <button
            key={type}
            className="btn btn-secondary"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, gap: 4 }}
            onClick={() => {
              let defaultData: AnyTokenData;
              switch (type) {
                case 'player':
                  defaultData = createDefaultPlayerData();
                  break;
                case 'monster':
                  defaultData = createDefaultMonsterData();
                  break;
                case 'companion':
                  defaultData = { tokenType: 'companion', name: 'Companion', ownerId: itemId, currentHp: 10, maxHp: 10, ac: 12, speed: 30, status: 'Alive', attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, abilities: [], actions: [], conditions: [], inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, carryCapacity: 50, notes: '', version: 1 };
                  break;
                case 'storage':
                  defaultData = { tokenType: 'storage', name: 'Chest', storageType: 'SmallChest', capacity: 30, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, locked: false, notes: '', version: 1 };
                  break;
                case 'lore':
                  defaultData = { tokenType: 'lore', name: 'Lore Entry', category: 'Location', summary: '', fullText: '', revealed: false, tags: [], notes: '', version: 1 };
                  break;
                case 'npc':
                  defaultData = { tokenType: 'npc', name: 'NPC', race: '', alignment: 'TN', occupation: '', location: '', personality: '', appearance: '', background: '', motivations: '', secrets: '', relationships: [], quests: [], notes: '', revealed: false, revealedFields: [], version: 1 };
                  break;
                case 'merchant':
                  defaultData = { tokenType: 'merchant', name: 'Merchant', shopName: 'The Shop', description: '', costInflation: 1.0, buybackRate: 0.5, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, notes: '', version: 1 };
                  break;
                default:
                  return;
              }
              onUpdate(defaultData);
            }}
          >
            <span style={{ fontSize: 24 }}>{icon}</span>
            <span style={{ fontSize: 11 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function createDefaultForType(type: string, currentData: AnyTokenData): AnyTokenData {
  switch (type) {
    case 'player': return createDefaultPlayerData();
    case 'monster': return createDefaultMonsterData();
    case 'companion': return { tokenType: 'companion', name: (currentData as { name?: string }).name || 'Companion', ownerId: '', currentHp: 10, maxHp: 10, ac: 12, speed: 30, status: 'Alive', attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, abilities: [], actions: [], conditions: [], inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, carryCapacity: 50, notes: '', version: 1 };
    case 'storage': return { tokenType: 'storage', name: (currentData as { name?: string }).name || 'Container', storageType: 'SmallChest', capacity: 30, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, locked: false, notes: '', version: 1 };
    case 'lore': return { tokenType: 'lore', name: (currentData as { name?: string }).name || 'Lore', category: 'Location', summary: '', fullText: '', revealed: false, tags: [], notes: '', version: 1 };
    case 'npc': return { tokenType: 'npc', name: (currentData as { name?: string }).name || 'NPC', race: '', alignment: 'TN', occupation: '', location: '', personality: '', appearance: '', background: '', motivations: '', secrets: '', relationships: [], quests: [], notes: '', revealed: false, revealedFields: [], version: 1 };
    case 'merchant': return { tokenType: 'merchant', name: (currentData as { name?: string }).name || 'Merchant', shopName: 'The Shop', description: '', costInflation: 1.0, buybackRate: 0.5, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, notes: '', version: 1 };
    default: return currentData;
  }
}

export function TokenSelector({ itemId, data, onUpdate, isGM, playerId, roomData, onRoomUpdate }: TokenSelectorProps) {
  const [showTrade, setShowTrade] = useState(false);

  if (!data) {
    return <NoTokenData itemId={itemId} isGM={isGM} onUpdate={onUpdate} />;
  }

  const calendar = roomData?.calendar;
  const weather = roomData?.weather;
  const onCalendarChange = isGM && onRoomUpdate ? (cal: CalendarConfig) => onRoomUpdate({ ...roomData!, calendar: cal }) : undefined;
  const onWeatherChange = isGM && onRoomUpdate ? (w: WeatherData) => onRoomUpdate({ ...roomData!, weather: w }) : undefined;
  const onTokenTypeChange = isGM ? (type: string) => onUpdate(createDefaultForType(type, data)) : undefined;

  switch (data.tokenType) {
    case 'player': {
      const player = data as PlayerData;
      const isOwner = player.ownerId === playerId;
      return (
        <>
          <PlayerToken
            player={player}
            onUpdate={(updated) => onUpdate(updated)}
            isGM={isGM}
            isOwner={isOwner || isGM}
            playerId={playerId}
            calendar={calendar}
            weather={weather}
            onCalendarChange={onCalendarChange}
            onWeatherChange={onWeatherChange}
            onTradeClick={() => setShowTrade(true)}
            itemId={itemId}
          />
          {showTrade && playerId && (
            <TradeSelector
              currentTokenId={itemId}
              currentData={player}
              playerId={playerId}
              isGM={isGM}
              roomData={roomData}
              onRoomUpdate={onRoomUpdate}
              onTradeComplete={(updated) => onUpdate(updated)}
              onClose={() => setShowTrade(false)}
            />
          )}
        </>
      );
    }
    case 'monster': {
      return (
        <MonsterToken
          monster={data as MonsterData}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'companion': {
      const companion = data as CompanionData;
      const isOwner = companion.ownerId === playerId;
      return (
        <CompanionToken
          companion={companion}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          canEdit={isOwner || isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'storage': {
      return (
        <StorageToken
          storage={data as StorageData}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          canAccess={isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'lore': {
      return (
        <LoreToken
          lore={data as LoreData}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'npc': {
      return (
        <NPCToken
          npc={data as NPCData}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'merchant': {
      return (
        <MerchantToken
          merchant={data as MerchantData}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    default:
      return <div className="loading">Unknown token type.</div>;
  }
}
