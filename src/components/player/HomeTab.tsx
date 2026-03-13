import React from 'react';
import { PlayerData } from '../../types';
import { StatBox } from '../common/StatBox';
import { ConditionGrid } from '../common/ConditionBadge';
import { getEncumbranceStatus, getInventoryWeight } from '../../utils';
import { ATTRIBUTES } from '../../constants';

interface HomeTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  isOwner: boolean;
  isGM: boolean;
  weather?: string;
  onTradeClick?: () => void;
  favoriteTokenIds?: string[]; // IDs of tokens to show as favorites
  currentTokenId?: string; // ID of this token
}

export function HomeTab({ player, onChange, isOwner, isGM, weather, onTradeClick, favoriteTokenIds, currentTokenId }: HomeTabProps) {
  const canEdit = isOwner || isGM;
  const enc = getEncumbranceStatus(player);
  const totalWeight = getInventoryWeight(player.inventory);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const updateAttr = (attr: string, val: number) =>
    onChange({ ...player, attributes: { ...player.attributes, [attr]: val } });

  const updateSave = (attr: string, val: number) =>
    onChange({ ...player, savingThrows: { ...player.savingThrows, [attr]: val } });

  const hasActiveConditions =
    player.conditions.length > 0 ||
    player.exhaustionLevel > 0 ||
    player.injuries.some((i) => !i.healed);

  // Favorites: track whether this token is favorited
  const isFavorited = currentTokenId && (player.favorites || []).includes(currentTokenId);
  const toggleFavorite = () => {
    if (!currentTokenId) return;
    const favs = player.favorites || [];
    update('favorites', favs.includes(currentTokenId)
      ? favs.filter((f) => f !== currentTokenId)
      : [...favs, currentTokenId]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Combat Stats */}
      <div>
        <div className="section-header">Combat</div>
        <div className="stat-grid stat-grid-3">
          <StatBox label="AC" value={player.ac} editable={canEdit}
            onChange={(v) => update('ac', v)} min={0} max={30} />
          <StatBox label="Initiative" value={player.initiativeBonus} editable={canEdit}
            onChange={(v) => update('initiativeBonus', v)} min={-10} max={20} />
          <StatBox label="Speed" value={player.speed} editable={canEdit}
            onChange={(v) => update('speed', v)} min={0} max={120} />
          <StatBox label="Passive Perc" value={player.passivePerception} editable={canEdit}
            onChange={(v) => update('passivePerception', v)} min={1} max={30} />
          <StatBox label="Passive Inv" value={player.passiveInvestigation} editable={canEdit}
            onChange={(v) => update('passiveInvestigation', v)} min={1} max={30} />
          <StatBox label="Passive Ins" value={player.passiveInsight} editable={canEdit}
            onChange={(v) => update('passiveInsight', v)} min={1} max={30} />
        </div>
      </div>

      {/* Attributes */}
      <div>
        <div className="section-header">Attributes</div>
        <div className="stat-grid stat-grid-6">
          {ATTRIBUTES.map((attr) => (
            <StatBox
              key={attr}
              label={attr}
              value={player.attributes[attr]}
              showModifier
              editable={canEdit}
              onChange={(v) => updateAttr(attr, v)}
            />
          ))}
        </div>
      </div>

      {/* Saving Throws */}
      <div>
        <div className="section-header">Saving Throws</div>
        <div className="stat-grid stat-grid-6">
          {ATTRIBUTES.map((attr) => (
            <div key={attr} className="stat-box">
              <span className="stat-box-label">{attr}</span>
              <input
                type="number"
                className="stat-box-value"
                value={player.savingThrows[attr]}
                onChange={(e) => updateSave(attr, parseInt(e.target.value) || 0)}
                disabled={!canEdit}
                style={{ width: '100%', textAlign: 'center', fontSize: 14 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Encumbrance warnings */}
      {enc !== 'normal' && (
        <div className={`badge badge-${enc === 'over' ? 'danger' : 'warning'}`}
          style={{ padding: '4px 8px', display: 'block' }}>
          {enc === 'over'
            ? '⚠ Over Encumbered — Disadvantage on attack rolls, initiative, STR & DEX rolls, half speed'
            : '⚡ Combat Encumbered — Disadvantage on attack rolls and initiative'}
          {' '}({totalWeight.toFixed(1)} units)
        </div>
      )}

      {/* Active Conditions (only if any are active) */}
      {hasActiveConditions && (
        <div>
          <div className="section-header">Active Conditions</div>
          {player.conditions.length > 0 && (
            <ConditionGrid
              active={player.conditions}
              onChange={(c) => update('conditions', c)}
              readonly={!canEdit}
            />
          )}
          {player.exhaustionLevel > 0 && (
            <div className="badge badge-warning" style={{ marginTop: 4, padding: '3px 6px', display: 'inline-block' }}>
              Exhaustion {player.exhaustionLevel}
            </div>
          )}
          {player.injuries.filter((i) => !i.healed).map((inj) => (
            <div key={inj.id} className={`injury-card ${inj.severity}`} style={{ marginTop: 4 }}>
              <strong>{inj.severity.toUpperCase()}</strong> — {inj.location}: {inj.description}
              {inj.maxHp && (
                <span style={{ float: 'right', fontSize: 10, color: 'var(--color-text-muted)' }}>
                  {inj.currentHp ?? inj.maxHp}/{inj.maxHp} HP
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Weather & Trade */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        {weather && (
          <div className="weather-display">
            <span>🌤</span>
            <span>{weather}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          {canEdit && currentTokenId && (
            <button
              className={`btn btn-sm ${isFavorited ? 'btn-warning' : 'btn-secondary'}`}
              onClick={toggleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '⭐ Favorited' : '☆ Favorite'}
            </button>
          )}
          {(isOwner || isGM) && onTradeClick && (
            <button className="btn btn-secondary btn-sm" onClick={onTradeClick}>
              💱 Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
