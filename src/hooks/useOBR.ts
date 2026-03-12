import { useState, useEffect, useCallback } from 'react';
import OBR, { Item as OBRItem, Player } from '@owlbear-rodeo/sdk';
import { TOKEN_NAMESPACE, ROOM_NAMESPACE } from '../constants';
import { AnyTokenData, PlayerRole, RoomMetadata } from '../types';
import { DEFAULT_CALENDAR, DEFAULT_EXHAUSTION_EFFECTS, DEFAULT_TRADE_RANGE } from '../constants';
import { generateWeather } from '../utils';

export function useOBRReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    OBR.onReady(() => setReady(true));
  }, []);

  return ready;
}

export function usePlayerRole(): PlayerRole {
  const [role, setRole] = useState<PlayerRole>('PLAYER');

  useEffect(() => {
    OBR.onReady(async () => {
      const obrRole = await OBR.player.getRole();
      setRole(obrRole === 'GM' ? 'GM' : 'PLAYER');

      OBR.player.onChange((player: Player) => {
        setRole(player.role === 'GM' ? 'GM' : 'PLAYER');
      });
    });
  }, []);

  return role;
}

export function usePlayerId(): string | null {
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    OBR.onReady(async () => {
      const id = await OBR.player.getId();
      setPlayerId(id);
    });
  }, []);

  return playerId;
}

export function useSelectedItems() {
  const [selectedItems, setSelectedItems] = useState<OBRItem[]>([]);

  useEffect(() => {
    OBR.onReady(async () => {
      const selection = await OBR.player.getSelection();
      const items = await OBR.scene.items.getItems(
        (item) => (selection ?? []).includes(item.id)
      );
      setSelectedItems(items);

      OBR.player.onChange(async (player: Player) => {
        const sel = player.selection ?? [];
        const selected = await OBR.scene.items.getItems(
          (item) => sel.includes(item.id)
        );
        setSelectedItems(selected);
      });
    });
  }, []);

  return selectedItems;
}

export function useTokenMetadata(itemId: string | null) {
  const [data, setData] = useState<AnyTokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) {
      setData(null);
      setLoading(false);
      return;
    }

    OBR.onReady(async () => {
      try {
        const items = await OBR.scene.items.getItems([itemId]);
        if (items.length > 0) {
          const tokenData = items[0].metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
          setData(tokenData || null);
        }
      } catch (e) {
        console.error('Error loading token metadata:', e);
      } finally {
        setLoading(false);
      }

      OBR.scene.items.onChange(async (items: OBRItem[]) => {
        const item = items.find((i) => i.id === itemId);
        if (item) {
          const tokenData = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
          setData(tokenData || null);
        }
      });
    });
  }, [itemId]);

  const updateData = useCallback(
    async (updater: (prev: AnyTokenData | null) => AnyTokenData) => {
      if (!itemId) return;
      try {
        await OBR.scene.items.updateItems([itemId], (items) => {
          for (const item of items) {
            const prev = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | null;
            item.metadata[TOKEN_NAMESPACE] = updater(prev);
          }
        });
      } catch (e) {
        console.error('Error updating token metadata:', e);
      }
    },
    [itemId]
  );

  return { data, loading, updateData };
}

const DEFAULT_ROOM_DATA: RoomMetadata = {
  calendar: DEFAULT_CALENDAR,
  weather: generateWeather('Temperate', DEFAULT_CALENDAR),
  biome: 'Temperate',
  tradeRange: DEFAULT_TRADE_RANGE,
  itemRepository: [],
  spellRepository: [],
  exhaustionConfig: DEFAULT_EXHAUSTION_EFFECTS,
  version: 1,
};

export function useRoomMetadata() {
  const [roomData, setRoomData] = useState<RoomMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const metadata = await OBR.room.getMetadata();
        const data = metadata[ROOM_NAMESPACE] as RoomMetadata | undefined;
        setRoomData(data || DEFAULT_ROOM_DATA);
      } catch (e) {
        console.error('Error loading room metadata:', e);
        setRoomData(DEFAULT_ROOM_DATA);
      } finally {
        setLoading(false);
      }

      OBR.room.onMetadataChange((metadata) => {
        const data = metadata[ROOM_NAMESPACE] as RoomMetadata | undefined;
        setRoomData(data || DEFAULT_ROOM_DATA);
      });
    });
  }, []);

  const updateRoomData = useCallback(async (updater: (prev: RoomMetadata) => RoomMetadata) => {
    try {
      await OBR.room.setMetadata({
        [ROOM_NAMESPACE]: updater(roomData || DEFAULT_ROOM_DATA),
      });
    } catch (e) {
      console.error('Error updating room metadata:', e);
    }
  }, [roomData]);

  return { roomData, loading, updateRoomData };
}
