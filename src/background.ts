import OBR, { Item as OBRItem } from '@owlbear-rodeo/sdk';
import { TOKEN_NAMESPACE } from './constants';
import { AnyTokenData, PlayerData, MonsterData } from './types';

OBR.onReady(async () => {
  console.log('Chronicles background script ready');

  OBR.scene.items.onChange(async (items: OBRItem[]) => {
    for (const item of items) {
      const data = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
      if (!data) continue;

      if (data.tokenType === 'player') {
        const player = data as PlayerData;
        const _badge = `${player.currentHp}/${player.maxHp}`;
      } else if (data.tokenType === 'monster') {
        const monster = data as MonsterData;
        const _badge = monster.status === 'Dead' ? '💀' : `${monster.currentHp}/${monster.maxHp}`;
      }
    }
  });
});
