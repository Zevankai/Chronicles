import React from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { AnyTokenData, PlayerData, MonsterData, CompanionData, StorageData, LoreData, NPCData, MerchantData, RoomMetadata, CalendarConfig, WeatherData, CalendarEvent, Item } from '../types';
import { PlayerToken } from './player';
import { MonsterToken } from './monster';
import { CompanionToken } from './companion';
import { StorageToken } from './storage';
import { LoreToken } from './lore';
import { NPCToken } from './npc';
import { MerchantToken } from './merchant';
import { createDefaultPlayerData, createDefaultMonsterData } from '../utils';
import { TOKEN_NAMESPACE } from '../constants';

interface TokenSelectorProps {
  itemId: string;
  data: AnyTokenData | null;
  onUpdate: (data: AnyTokenData) => void;
  isGM: boolean;
  playerId: string | null;
  roomData: RoomMetadata | null;
  onRoomUpdate?: (data: RoomMetadata) => void;
  tokenImageUrl?: string | null;
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
                  defaultData = { tokenType: 'companion', name: 'Companion', ownerId: itemId, currentHp: 10, maxHp: 10, ac: 12, speed: 30, status: 'Alive', attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, abilities: [], actions: [], conditions: [], inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, carryCapacity: 60, size: 'medium', notes: '', version: 1 };
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
    case 'companion': return { tokenType: 'companion', name: (currentData as { name?: string }).name || 'Companion', ownerId: '', currentHp: 10, maxHp: 10, ac: 12, speed: 30, status: 'Alive', attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, abilities: [], actions: [], conditions: [], inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, carryCapacity: 60, size: 'medium', notes: '', version: 1 };
    case 'storage': return { tokenType: 'storage', name: (currentData as { name?: string }).name || 'Container', storageType: 'SmallChest', capacity: 30, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, locked: false, notes: '', version: 1 };
    case 'lore': return { tokenType: 'lore', name: (currentData as { name?: string }).name || 'Lore', category: 'Location', summary: '', fullText: '', revealed: false, tags: [], notes: '', version: 1 };
    case 'npc': return { tokenType: 'npc', name: (currentData as { name?: string }).name || 'NPC', race: '', alignment: 'TN', occupation: '', location: '', personality: '', appearance: '', background: '', motivations: '', secrets: '', relationships: [], quests: [], notes: '', revealed: false, revealedFields: [], version: 1 };
    case 'merchant': return { tokenType: 'merchant', name: (currentData as { name?: string }).name || 'Merchant', shopName: 'The Shop', description: '', costInflation: 1.0, buybackRate: 0.5, inventory: [], coins: { cp: 0, sp: 0, gp: 0, pp: 0 }, notes: '', version: 1 };
    default: return currentData;
  }
}

export function TokenSelector({ itemId, data, onUpdate, isGM, playerId, roomData, onRoomUpdate, tokenImageUrl }: TokenSelectorProps) {
  if (!data) {
    return <NoTokenData itemId={itemId} isGM={isGM} onUpdate={onUpdate} />;
  }

  const calendar = roomData?.calendar;
  const weather = roomData?.weather;
  const calendarEvents = roomData?.calendarEvents ?? [];
  const allowPlayerItemCreation = roomData?.allowPlayerItemCreation !== false; // default true
  const onCalendarChange = isGM && onRoomUpdate ? (cal: CalendarConfig) => onRoomUpdate({ ...roomData!, calendar: cal }) : undefined;
  const onWeatherChange = isGM && onRoomUpdate ? (w: WeatherData) => onRoomUpdate({ ...roomData!, weather: w }) : undefined;
  const onEventsChange = isGM && onRoomUpdate ? (events: CalendarEvent[]) => onRoomUpdate({ ...roomData!, calendarEvents: events }) : undefined;
  const onTokenTypeChange = isGM ? (type: string) => onUpdate(createDefaultForType(type, data)) : undefined;

  switch (data.tokenType) {
    case 'player': {
      const player = data as PlayerData;
      const isOwner = player.ownerId === playerId || player.claimedBy === playerId;
      return (
        <PlayerToken
          player={player}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          isOwner={isOwner || isGM}
          playerId={playerId}
          calendar={calendar}
          weather={weather}
          calendarEvents={calendarEvents}
          onCalendarChange={onCalendarChange}
          onWeatherChange={onWeatherChange}
          onEventsChange={onEventsChange}
          onTradeClick={isOwner || isGM ? () => {
            const base = window.location.href.split('?')[0];
            OBR.popover.open({
              id: 'chronicles-trade',
              url: `${base}?view=trade&itemId=${encodeURIComponent(itemId)}`,
              width: 700,
              height: 600,
            });
          } : undefined}
          itemId={itemId}
          tokenImageUrl={tokenImageUrl}
          allowPlayerItemCreation={isGM ? true : allowPlayerItemCreation}
        />
      );
    }
    case 'monster': {
      const monster = data as MonsterData;
      // Build a callback for players to take loot directly
      const handlePlayerTakeLoot = (!isGM && (monster.status === 'Dead' || monster.status === 'Vulnerable') && playerId)
        ? async (items: { item: Item; qty: number }[], coins: { cp: number; sp: number; gp: number; pp: number }) => {
            // Find the player's own token to add loot to
            try {
              const allItems = await OBR.scene.items.getItems();
              const playerItem = allItems.find((i) => {
                const td = i.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
                return td?.tokenType === 'player' && (td as PlayerData).ownerId === playerId;
              });
              if (playerItem) {
                const playerData = playerItem.metadata[TOKEN_NAMESPACE] as PlayerData;
                let inv = [...playerData.inventory];
                for (const { item, qty } of items) {
                  const existing = inv.find((i) => i.id === item.id);
                  if (existing) {
                    inv = inv.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
                  } else {
                    inv = [...inv, { ...item, quantity: qty }];
                  }
                }
                const updatedCoins = {
                  cp: playerData.coins.cp + coins.cp,
                  sp: playerData.coins.sp + coins.sp,
                  gp: playerData.coins.gp + coins.gp,
                  pp: playerData.coins.pp + coins.pp,
                };
                await OBR.scene.items.updateItems([playerItem.id], (obrItems) => {
                  for (const obrItem of obrItems) {
                    obrItem.metadata[TOKEN_NAMESPACE] = { ...playerData, inventory: inv, coins: updatedCoins };
                  }
                });
              }
            } catch (e) {
              console.error('Failed to transfer loot to player:', e);
            }
          }
        : undefined;

      return (
        <MonsterToken
          monster={monster}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          onPlayerTakeLoot={handlePlayerTakeLoot}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'companion': {
      const companion = data as CompanionData;
      const isOwner = companion.claimedBy === playerId || companion.ownerId === playerId;
      return (
        <CompanionToken
          companion={companion}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          canEdit={isOwner || isGM}
          allowPlayerItemCreation={isGM ? true : allowPlayerItemCreation}
          calendar={calendar}
          onCalendarChange={onCalendarChange}
          onTokenTypeChange={onTokenTypeChange}
          playerId={playerId}
        />
      );
    }
    case 'storage': {
      const storage = data as StorageData;
      const canAccess = !storage.locked || storage.claimedBy === playerId || isGM;
      return (
        <StorageToken
          storage={storage}
          onUpdate={(updated) => onUpdate(updated)}
          isGM={isGM}
          canAccess={canAccess}
          allowPlayerItemCreation={isGM ? true : allowPlayerItemCreation}
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
