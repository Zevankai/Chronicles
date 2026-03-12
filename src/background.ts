import OBR, { Item as OBRItem } from '@owlbear-rodeo/sdk';
import { TOKEN_NAMESPACE } from './constants';
import { AnyTokenData, PlayerData, MonsterData } from './types';

function getBadgeText(data: AnyTokenData): string {
  if (data.tokenType === 'player') {
    const player = data as PlayerData;
    return `${player.currentHp}/${player.maxHp}`;
  }
  if (data.tokenType === 'monster') {
    const monster = data as MonsterData;
    return monster.status === 'Dead' ? '💀' : `${monster.currentHp}/${monster.maxHp}`;
  }
  return '';
}

OBR.onReady(async () => {
  console.log('Chronicles background script ready');

  OBR.contextMenu.create({
    id: `${TOKEN_NAMESPACE}/menu/open`,
    icons: [
      {
        icon: '/icon.svg',
        label: 'Chronicles',
        filter: {
          every: [
            { key: 'type', value: 'IMAGE' },
            { key: 'layer', value: 'CHARACTER', coordinator: '||' },
            { key: 'layer', value: 'MOUNT' },
          ],
        },
      },
    ],
    embed: {
      url: '/index.html',
      height: 600,
      width: 350,
    },
  });

  // Monitor token changes and log badge text for HP/status tracking.
  // Badge text can be used by the room GM to track health at a glance.
  OBR.scene.items.onChange((items: OBRItem[]) => {
    for (const item of items) {
      const data = item.metadata[TOKEN_NAMESPACE] as AnyTokenData | undefined;
      if (!data) continue;
      const badge = getBadgeText(data);
      if (badge) {
        console.debug(`[Chronicles] ${item.id} badge: ${badge}`);
      }
    }
  });
});
