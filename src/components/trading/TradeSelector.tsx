import React, { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { AnyTokenData, PlayerData, MonsterData, StorageData, CompanionData, MerchantData, RoomMetadata, Item, Coins } from '../../types';
import { TOKEN_NAMESPACE, ROOM_NAMESPACE } from '../../constants';
import { TradeModal } from './TradeModal';

interface TradableToken {
  id: string;
  name: string;
  type: string;
  data: AnyTokenData;
  icon: string;
}

interface TradeSelectorProps {
  currentTokenId: string;
  currentData: PlayerData;
  playerId: string;
  isGM: boolean;
  roomData: RoomMetadata | null;
  onRoomUpdate?: (data: RoomMetadata) => void;
  onTradeComplete?: (updatedCurrentData: PlayerData) => void;
  onClose: () => void;
}

export function TradeSelector({
  currentTokenId,
  currentData,
  playerId,
  isGM,
  roomData,
  onRoomUpdate,
  onTradeComplete,
  onClose,
}: TradeSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [tradableTokens, setTradableTokens] = useState<TradableToken[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<TradableToken | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadTradableTokens();
  }, []);

  const loadTradableTokens = async () => {
    setLoading(true);
    try {
      const allItems = await OBR.scene.items.getItems();
      const tokens: TradableToken[] = [];

      for (const item of allItems) {
        if (item.id === currentTokenId) continue;
        const data = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
        if (!data) continue;

        let icon = '';
        let name = '';
        let include = false;

        if (data.tokenType === 'monster') {
          const monster = data as MonsterData;
          if (monster.status === 'Dead' || monster.status === 'Vulnerable') {
            icon = '👹';
            name = monster.name;
            include = true;
          }
        } else if (data.tokenType === 'storage') {
          const storage = data as StorageData;
          if (!storage.locked || storage.claimedBy === playerId || isGM) {
            icon = '📦';
            name = storage.name;
            include = true;
          }
        } else if (data.tokenType === 'merchant') {
          const merchant = data as MerchantData;
          icon = '🏪';
          name = merchant.name;
          include = true;
        } else if (data.tokenType === 'companion') {
          const companion = data as CompanionData;
          if (!companion.claimedBy || companion.claimedBy === playerId || companion.ownerId === playerId || isGM) {
            icon = '🐾';
            name = companion.name;
            include = true;
          }
        } else if (data.tokenType === 'player') {
          const player = data as PlayerData;
          if (player.ownerId !== playerId) {
            icon = '👤';
            name = player.name;
            include = true;
          }
        }

        if (include) {
          tokens.push({ id: item.id, name, type: data.tokenType, data, icon });
        }
      }

      setTradableTokens(tokens);
    } catch (e) {
      console.error('Failed to load tradable tokens:', e);
    }
    setLoading(false);
  };

  const handleSelectTarget = (token: TradableToken) => {
    // Check if token is already in a trade
    const activeTrades = roomData?.activeTrades || {};
    const currentTrader = activeTrades[token.id];

    if (currentTrader && currentTrader !== playerId) {
      setNotification('This token is already trading with another player.');
      return;
    }

    // Lock the token for this player's trade session
    if (onRoomUpdate && roomData) {
      onRoomUpdate({
        ...roomData,
        activeTrades: {
          ...activeTrades,
          [token.id]: playerId,
          [currentTokenId]: playerId,
        },
      });
    }

    setSelectedTarget(token);
    setNotification(null);
  };

  const handleTradeClose = () => {
    // Release trade lock
    if (onRoomUpdate && roomData) {
      const activeTrades = { ...(roomData.activeTrades || {}) };
      delete activeTrades[selectedTarget?.id || ''];
      delete activeTrades[currentTokenId];
      onRoomUpdate({ ...roomData, activeTrades });
    }
    setSelectedTarget(null);
  };

  const handleTradeConfirm = async (
    initiatorGives: { items: { item: Item; qty: number }[]; coins: Coins },
    targetGives: { items: { item: Item; qty: number }[]; coins: Coins }
  ) => {
    if (!selectedTarget) return;

    try {
      // Apply trade: remove items from current player, add target items
      let updatedCurrentInventory = [...currentData.inventory];
      let updatedCurrentCoins = { ...currentData.coins };

      // Remove items given by current player
      for (const { item, qty } of initiatorGives.items) {
        updatedCurrentInventory = updatedCurrentInventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - qty } : i
        ).filter((i) => i.quantity > 0);
      }

      // Deduct coins given by current player
      updatedCurrentCoins = {
        cp: Math.max(0, updatedCurrentCoins.cp - initiatorGives.coins.cp),
        sp: Math.max(0, updatedCurrentCoins.sp - initiatorGives.coins.sp),
        gp: Math.max(0, updatedCurrentCoins.gp - initiatorGives.coins.gp),
        pp: Math.max(0, updatedCurrentCoins.pp - initiatorGives.coins.pp),
      };

      // Add items received from target
      for (const { item, qty } of targetGives.items) {
        const existing = updatedCurrentInventory.find((i) => i.id === item.id);
        if (existing) {
          updatedCurrentInventory = updatedCurrentInventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          updatedCurrentInventory = [...updatedCurrentInventory, { ...item, quantity: qty }];
        }
      }

      // Add coins received from target
      updatedCurrentCoins = {
        cp: updatedCurrentCoins.cp + targetGives.coins.cp,
        sp: updatedCurrentCoins.sp + targetGives.coins.sp,
        gp: updatedCurrentCoins.gp + targetGives.coins.gp,
        pp: updatedCurrentCoins.pp + targetGives.coins.pp,
      };

      const updatedCurrentData: PlayerData = {
        ...currentData,
        inventory: updatedCurrentInventory,
        coins: updatedCurrentCoins,
      };

      // Update target token
      const targetData = selectedTarget.data;
      let updatedTargetInventory: Item[] = [];
      let updatedTargetCoins: Coins = { cp: 0, sp: 0, gp: 0, pp: 0 };

      if ('inventory' in targetData) {
        updatedTargetInventory = [...(targetData as { inventory: Item[] }).inventory];
      }
      if ('coins' in targetData) {
        updatedTargetCoins = { ...(targetData as { coins: Coins }).coins };
      } else if ('lootCoins' in targetData) {
        updatedTargetCoins = { ...(targetData as { lootCoins: Coins }).lootCoins };
      }

      // Remove items given by target
      for (const { item, qty } of targetGives.items) {
        updatedTargetInventory = updatedTargetInventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - qty } : i
        ).filter((i) => i.quantity > 0);
      }
      updatedTargetCoins = {
        cp: Math.max(0, updatedTargetCoins.cp - targetGives.coins.cp),
        sp: Math.max(0, updatedTargetCoins.sp - targetGives.coins.sp),
        gp: Math.max(0, updatedTargetCoins.gp - targetGives.coins.gp),
        pp: Math.max(0, updatedTargetCoins.pp - targetGives.coins.pp),
      };

      // Add items given by initiator to target
      for (const { item, qty } of initiatorGives.items) {
        const existing = updatedTargetInventory.find((i) => i.id === item.id);
        if (existing) {
          updatedTargetInventory = updatedTargetInventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          updatedTargetInventory = [...updatedTargetInventory, { ...item, quantity: qty }];
        }
      }
      updatedTargetCoins = {
        cp: updatedTargetCoins.cp + initiatorGives.coins.cp,
        sp: updatedTargetCoins.sp + initiatorGives.coins.sp,
        gp: updatedTargetCoins.gp + initiatorGives.coins.gp,
        pp: updatedTargetCoins.pp + initiatorGives.coins.pp,
      };

      // Build updated target data
      let updatedTargetData: AnyTokenData;
      if ('lootCoins' in targetData) {
        updatedTargetData = {
          ...targetData,
          loot: updatedTargetInventory,
          lootCoins: updatedTargetCoins,
        } as AnyTokenData;
      } else if ('coins' in targetData) {
        updatedTargetData = {
          ...targetData,
          inventory: updatedTargetInventory,
          coins: updatedTargetCoins,
        } as AnyTokenData;
      } else {
        updatedTargetData = { ...targetData } as AnyTokenData;
      }

      // Save both changes via OBR
      await OBR.scene.items.updateItems(
        [selectedTarget.id],
        (items) => {
          for (const item of items) {
            item.metadata[TOKEN_NAMESPACE] = updatedTargetData;
          }
        }
      );

      onTradeComplete?.(updatedCurrentData);
    } catch (e) {
      console.error('Trade failed:', e);
    }

    handleTradeClose();
    onClose();
  };

  if (selectedTarget) {
    const targetInventory = (() => {
      if ('loot' in selectedTarget.data) return (selectedTarget.data as MonsterData).loot;
      if ('inventory' in selectedTarget.data) return (selectedTarget.data as { inventory: Item[] }).inventory;
      return [];
    })();
    const targetCoins = (() => {
      if ('lootCoins' in selectedTarget.data) return (selectedTarget.data as MonsterData).lootCoins;
      if ('coins' in selectedTarget.data) return (selectedTarget.data as { coins: Coins }).coins;
      return { cp: 0, sp: 0, gp: 0, pp: 0 };
    })();

    return (
      <TradeModal
        initiator={{
          id: currentTokenId,
          name: currentData.name,
          inventory: currentData.inventory,
          coins: currentData.coins,
          type: 'player',
        }}
        target={{
          id: selectedTarget.id,
          name: selectedTarget.name,
          inventory: targetInventory,
          coins: targetCoins,
          type: selectedTarget.type as 'player' | 'companion' | 'storage' | 'monster',
        }}
        onConfirm={handleTradeConfirm}
        onClose={handleTradeClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">💱 Trade — Select Target</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {notification && (
          <div className="badge badge-warning" style={{ display: 'block', padding: '6px 10px', marginBottom: 8, fontSize: 12 }}>
            ⚠ {notification}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-muted)' }}>
            Loading nearby tokens...
          </div>
        ) : tradableTokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
            No tradeable tokens nearby.
            <div style={{ fontSize: 11, marginTop: 4 }}>
              (Dead/Vulnerable monsters, storage, merchants, companions, other players)
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tradableTokens.map((token) => {
              const activeTrades = roomData?.activeTrades || {};
              const isLocked = !!(activeTrades[token.id] && activeTrades[token.id] !== playerId);
              return (
                <button
                  key={token.id}
                  className={`btn btn-secondary${isLocked ? ' btn-disabled' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isLocked ? 0.5 : 1 }}
                  onClick={() => !isLocked && handleSelectTarget(token)}
                  disabled={isLocked}
                >
                  <span>{token.icon} {token.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {isLocked ? '🔒 In Trade' : token.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
