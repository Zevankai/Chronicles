import React, { useState, useEffect, useCallback, useRef } from 'react';
import OBR, { Item as OBRItem, Player } from '@owlbear-rodeo/sdk';
import { AnyTokenData, PlayerData, MerchantData, RoomMetadata } from './types';
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
  // Map of tokenId -> token data for favorited token resolution
  allTokensMap: Record<string, AnyTokenData>;
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
    allTokensMap: {},
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

        // Populate allTokensMap on initial load so favorites work immediately
        try {
          const allItems = await OBR.scene.items.getItems();
          const initialMap: Record<string, AnyTokenData> = {};
          for (const item of allItems) {
            const td = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
            if (td) initialMap[item.id] = td;
          }
          updateState({ allTokensMap: initialMap });
        } catch (e) {
          console.warn('Could not load initial scene items:', e);
        }

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
          // Update allTokensMap with all tokens that have Chronicles data
          const newMap: Record<string, AnyTokenData> = {};
          for (const item of items) {
            const td = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
            if (td) newMap[item.id] = td;
          }
          const partial: Partial<AppState> = { allTokensMap: newMap };
          if (currentId) {
            const item = items.find((i) => i.id === currentId);
            if (item) {
              const tokenData = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
              partial.tokenData = tokenData ?? null;
            }
          }
          updateState(partial);
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
    // Find all player tokens that have this player ID in their favorites
    // (player tokens that favor THIS user's session - identify by ownerId match)
    // Also show tokens that the current user's player character has favorited
    const playerToken = state.playerId
      ? Object.values(state.allTokensMap).find(
          (td) => td.tokenType === 'player' && (td as PlayerData).ownerId === state.playerId
        ) as PlayerData | undefined
      : undefined;
    const favoritedTokenIds: string[] = playerToken?.favorites ?? [];
    const favoritedTokens = favoritedTokenIds
      .map((id) => ({ id, data: state.allTokensMap[id] }))
      .filter((t) => t.data != null);

    return (
      <div className="chronicles-app">
        <div style={{ padding: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📜</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--color-primary)', marginBottom: 4 }}>
              Chronicles
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Select a token on the map to view its details.
            </div>
          </div>

          {/* Favorited tokens */}
          {favoritedTokens.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="section-header">⭐ Favorited Tokens</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {favoritedTokens.map(({ id, data }) => (
                  <button
                    key={id}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', textAlign: 'left' }}
                    onClick={async () => {
                      try {
                        const items = await OBR.scene.items.getItems([id]);
                        if (items.length > 0) {
                          await OBR.player.select([id]);
                        }
                      } catch (e) {
                        console.warn('Could not select favorited token:', e);
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>
                      {data.tokenType === 'player' ? '👤' :
                       data.tokenType === 'monster' ? '👹' :
                       data.tokenType === 'companion' ? '🐾' :
                       data.tokenType === 'storage' ? '📦' :
                       data.tokenType === 'merchant' ? '🏪' :
                       data.tokenType === 'npc' ? '🧙' : '📜'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 12 }}>{(data as { name: string }).name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{data.tokenType}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.isGM && state.roomData && (state.roomData.pendingMerchantTrades || []).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="section-header" style={{ color: 'var(--color-warning)' }}>⏳ Pending Merchant Trades</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(state.roomData.pendingMerchantTrades || []).map((trade) => (
                  <div key={trade.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-warning)', borderRadius: 6, padding: 8, fontSize: 11 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {trade.playerName} ↔ {trade.merchantName}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>
                      Player gives: {trade.playerGives.items.map((x) => `${x.item.name} ×${x.quantity}`).join(', ') || 'nothing'}
                      {trade.playerGives.coins.gp > 0 && ` · ${trade.playerGives.coins.gp}gp`}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>
                      Receives: {trade.merchantGives.items.map((x) => `${x.item.name} ×${x.quantity}`).join(', ') || 'nothing'}
                      {trade.merchantGives.coins.gp > 0 && ` · ${trade.merchantGives.coins.gp}gp`}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={async () => {
                          // Approve: execute the trade
                          try {
                            const allItems = await OBR.scene.items.getItems();
                            const playerItem = allItems.find((i) => {
                              const td = i.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
                              return td?.tokenType === 'player' && (td as PlayerData).ownerId === trade.playerId;
                            });
                            const merchantItem = allItems.find((i) => i.id === trade.merchantId);
                            if (playerItem && merchantItem) {
                              const playerData = playerItem.metadata[TOKEN_NAMESPACE] as PlayerData;
                              const merchantData = merchantItem.metadata[TOKEN_NAMESPACE] as MerchantData;
                              // Update player
                              let inv = [...playerData.inventory];
                              let coins = { ...playerData.coins };
                              for (const { item, quantity } of trade.playerGives.items) {
                                inv = inv.map((i) => i.id === item.id ? { ...i, quantity: i.quantity - quantity } : i).filter((i) => i.quantity > 0);
                              }
                              coins = { cp: Math.max(0, coins.cp - trade.playerGives.coins.cp), sp: Math.max(0, coins.sp - trade.playerGives.coins.sp), gp: Math.max(0, coins.gp - trade.playerGives.coins.gp), pp: Math.max(0, coins.pp - trade.playerGives.coins.pp) };
                              for (const { item, quantity } of trade.merchantGives.items) {
                                const ex = inv.find((i) => i.id === item.id);
                                inv = ex ? inv.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i) : [...inv, { ...item, quantity }];
                              }
                              coins = { cp: coins.cp + trade.merchantGives.coins.cp, sp: coins.sp + trade.merchantGives.coins.sp, gp: coins.gp + trade.merchantGives.coins.gp, pp: coins.pp + trade.merchantGives.coins.pp };
                              await OBR.scene.items.updateItems([playerItem.id], (items) => { for (const i of items) i.metadata[TOKEN_NAMESPACE] = { ...playerData, inventory: inv, coins }; });
                              // Update merchant
                              let mInv = [...(merchantData.inventory || [])];
                              let mCoins = { ...merchantData.coins };
                              for (const { item, quantity } of trade.merchantGives.items) {
                                mInv = mInv.map((i) => i.id === item.id ? { ...i, quantity: i.quantity - quantity } : i).filter((i) => i.quantity > 0);
                              }
                              mCoins = { cp: Math.max(0, mCoins.cp - trade.merchantGives.coins.cp), sp: Math.max(0, mCoins.sp - trade.merchantGives.coins.sp), gp: Math.max(0, mCoins.gp - trade.merchantGives.coins.gp), pp: Math.max(0, mCoins.pp - trade.merchantGives.coins.pp) };
                              for (const { item, quantity } of trade.playerGives.items) {
                                const ex = mInv.find((i) => i.id === item.id);
                                mInv = ex ? mInv.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i) : [...mInv, { ...item, quantity }];
                              }
                              mCoins = { cp: mCoins.cp + trade.playerGives.coins.cp, sp: mCoins.sp + trade.playerGives.coins.sp, gp: mCoins.gp + trade.playerGives.coins.gp, pp: mCoins.pp + trade.playerGives.coins.pp };
                              await OBR.scene.items.updateItems([merchantItem.id], (items) => { for (const i of items) i.metadata[TOKEN_NAMESPACE] = { ...merchantData, inventory: mInv, coins: mCoins }; });
                            }
                          } catch (e) { console.error('Failed to approve trade:', e); }
                          // Remove from pending
                          const updatedRoom = { ...state.roomData!, pendingMerchantTrades: (state.roomData!.pendingMerchantTrades || []).filter((t) => t.id !== trade.id) };
                          handleRoomUpdate(updatedRoom);
                        }}
                      >✅ Approve</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          const updatedRoom = { ...state.roomData!, pendingMerchantTrades: (state.roomData!.pendingMerchantTrades || []).filter((t) => t.id !== trade.id) };
                          handleRoomUpdate(updatedRoom);
                        }}
                      >❌ Deny</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.isGM && state.roomData && (
            <div style={{ textAlign: 'left', background: 'var(--color-surface)', borderRadius: 8, padding: 12, border: '1px solid var(--color-border-light)' }}>
              <div className="section-header">Room Status</div>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <div>📅 {state.roomData.calendar.months[state.roomData.calendar.currentMonth]?.name} {state.roomData.calendar.currentDay}, {state.roomData.calendar.currentYear} {state.roomData.calendar.yearSuffix}</div>
                <div>🌤 {state.roomData.weather.type} ({state.roomData.weather.temperature}°F)</div>
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
