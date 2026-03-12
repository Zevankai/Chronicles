import React, { useState, useEffect, useCallback, useRef } from 'react';
import OBR, { Item as OBRItem, Player } from '@owlbear-rodeo/sdk';
import { AnyTokenData, RoomMetadata } from './types';
import { TOKEN_NAMESPACE, ROOM_NAMESPACE, DEFAULT_CALENDAR, DEFAULT_EXHAUSTION_EFFECTS, DEFAULT_TRADE_RANGE } from './constants';
import { generateWeather } from './utils';
import { TokenSelector } from './components/TokenSelector';
import './styles/theme.css';

interface AppState {
  ready: boolean;
  isGM: boolean;
  playerId: string | null;
  selectedItemId: string | null;
  tokenData: AnyTokenData | null;
  roomData: RoomMetadata | null;
  loading: boolean;
  error: string | null;
}

const defaultRoomData: RoomMetadata = {
  calendar: DEFAULT_CALENDAR,
  weather: generateWeather('Temperate', DEFAULT_CALENDAR),
  biome: 'Temperate',
  tradeRange: DEFAULT_TRADE_RANGE,
  itemRepository: [],
  spellRepository: [],
  exhaustionConfig: DEFAULT_EXHAUSTION_EFFECTS,
  version: 1,
};

export default function App() {
  const [state, setState] = useState<AppState>({
    ready: false,
    isGM: false,
    playerId: null,
    selectedItemId: null,
    tokenData: null,
    roomData: null,
    loading: true,
    error: null,
  });

  // Keep a ref to selectedItemId so callbacks always see the latest value
  const selectedItemIdRef = useRef<string | null>(null);

  const updateState = useCallback((partial: Partial<AppState>) =>
    setState((prev) => {
      const next = { ...prev, ...partial };
      if ('selectedItemId' in partial) {
        selectedItemIdRef.current = partial.selectedItemId ?? null;
      }
      return next;
    }), []);

  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const [role, playerId] = await Promise.all([
          OBR.player.getRole(),
          OBR.player.getId(),
        ]);

        const isGM = role === 'GM';

        let roomData: RoomMetadata = defaultRoomData;
        try {
          const metadata = await OBR.room.getMetadata();
          if (metadata[ROOM_NAMESPACE]) {
            roomData = metadata[ROOM_NAMESPACE] as RoomMetadata;
          }
        } catch (e) {
          console.warn('Could not load room metadata:', e);
        }

        updateState({ ready: true, isGM, playerId, roomData, loading: false });

        OBR.player.onChange(async (player: Player) => {
          if (player.selection && player.selection.length > 0) {
            const itemId = player.selection[0];
            try {
              const items = await OBR.scene.items.getItems([itemId]);
              if (items.length > 0) {
                const tokenData = items[0].metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
                updateState({ selectedItemId: itemId, tokenData: tokenData ?? null });
              }
            } catch (e) {
              console.warn('Could not load item metadata:', e);
            }
          } else {
            updateState({ selectedItemId: null, tokenData: null });
          }
        });

        OBR.scene.items.onChange(async (items: OBRItem[]) => {
          const currentId = selectedItemIdRef.current;
          if (currentId) {
            const item = items.find((i) => i.id === currentId);
            if (item) {
              const tokenData = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
              updateState({ tokenData: tokenData ?? null });
            }
          }
        });

        OBR.room.onMetadataChange((metadata) => {
          if (metadata[ROOM_NAMESPACE]) {
            updateState({ roomData: metadata[ROOM_NAMESPACE] as RoomMetadata });
          }
        });

      } catch (e) {
        console.error('Chronicles initialization error:', e);
        updateState({ error: 'Failed to initialize Chronicles.', loading: false });
      }
    });
  }, [updateState]);

  const handleTokenUpdate = useCallback(async (updated: AnyTokenData) => {
    const itemId = selectedItemIdRef.current;
    if (!itemId) return;
    updateState({ tokenData: updated });
    try {
      await OBR.scene.items.updateItems([itemId], (items) => {
        for (const item of items) {
          item.metadata[TOKEN_NAMESPACE] = updated;
        }
      });
    } catch (e) {
      console.error('Failed to save token data:', e);
    }
  }, [updateState]);

  const handleRoomUpdate = useCallback(async (updated: RoomMetadata) => {
    updateState({ roomData: updated });
    try {
      await OBR.room.setMetadata({ [ROOM_NAMESPACE]: updated });
    } catch (e) {
      console.error('Failed to save room data:', e);
    }
  }, [updateState]);

  if (!state.ready) {
    return (
      <div className="chronicles-app">
        <div className="loading">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📜</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--color-primary)' }}>
              Chronicles
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {state.error || 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.selectedItemId) {
    return (
      <div className="chronicles-app">
        <div style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📜</div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--color-primary)', marginBottom: 4 }}>
            Chronicles
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Select a token on the map to view its details.
          </div>
          {state.isGM && state.roomData && (
            <div style={{ textAlign: 'left', background: 'var(--color-surface)', borderRadius: 8, padding: 12, border: '1px solid var(--color-border-light)' }}>
              <div className="section-header">Room Status</div>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <div>📅 {state.roomData.calendar.months[state.roomData.calendar.currentMonth]?.name} {state.roomData.calendar.currentDay}, {state.roomData.calendar.currentYear} {state.roomData.calendar.yearSuffix}</div>
                <div>🌤 {state.roomData.weather.type} ({state.roomData.weather.temperature}°C)</div>
                <div>🌍 Biome: {state.roomData.biome}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="section-header">Biome</div>
                <select
                  value={state.roomData.biome}
                  onChange={(e) => handleRoomUpdate({ ...state.roomData!, biome: e.target.value as RoomMetadata['biome'] })}
                  style={{ marginTop: 4 }}
                >
                  {['Temperate', 'Mediterranean', 'Tropical', 'Desert', 'Ocean', 'Tundra'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => {
                  const newWeather = generateWeather(state.roomData!.biome, state.roomData!.calendar);
                  handleRoomUpdate({ ...state.roomData!, weather: newWeather });
                }}
              >
                🎲 Generate Weather
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chronicles-app">
      <TokenSelector
        itemId={state.selectedItemId}
        data={state.tokenData}
        onUpdate={handleTokenUpdate}
        isGM={state.isGM}
        playerId={state.playerId}
        roomData={state.roomData}
        onRoomUpdate={handleRoomUpdate}
      />
    </div>
  );
}
