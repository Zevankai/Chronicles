import React, { useState } from 'react';
import { PlayerData, ConditionName } from '../../types';
import { StatBox } from '../common/StatBox';
import { HPBar } from '../common/HPBar';
import { ConditionGrid } from '../common/ConditionBadge';
import { getModifier, getModifierString, getEncumbranceStatus, getInventoryWeight } from '../../utils';
import { ATTRIBUTES } from '../../constants';

interface HomeTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  isOwner: boolean;
  isGM: boolean;
  weather?: string;
  onTradeClick?: () => void;
}

export function HomeTab({ player, onChange, isOwner, isGM, weather, onTradeClick }: HomeTabProps) {
  const canEdit = isOwner || isGM;
  const enc = getEncumbranceStatus(player);
  const totalWeight = getInventoryWeight(player.inventory);

  const update = <K extends keyof PlayerData>(key: K, value: PlayerData[K]) =>
    onChange({ ...player, [key]: value });

  const updateAttr = (attr: string, val: number) =>
    onChange({ ...player, attributes: { ...player.attributes, [attr]: val } });

  const updateSave = (attr: string, val: number) =>
    onChange({ ...player, savingThrows: { ...player.savingThrows, [attr]: val } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Identity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label className="field-label">Name</label>
          <input type="text" value={player.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Class</label>
          <input type="text" value={player.playerClass}
            onChange={(e) => update('playerClass', e.target.value)}
            disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Race</label>
          <input type="text" value={player.race}
            onChange={(e) => update('race', e.target.value)}
            disabled={!canEdit} />
        </div>
        <div>
          <label className="field-label">Level</label>
          <input type="number" value={player.level} min={1} max={20}
            onChange={(e) => update('level', parseInt(e.target.value) || 1)}
            disabled={!canEdit} />
        </div>
      </div>

      {/* HP Section */}
      <div>
        <div className="section-header">Hit Points</div>
        <HPBar current={player.currentHp} max={player.maxHp} temp={player.tempHp} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 6 }}>
          <div>
            <label className="field-label">Current HP</label>
            <input type="number" value={player.currentHp}
              onChange={(e) => update('currentHp', parseInt(e.target.value) || 0)}
              disabled={!canEdit} />
          </div>
          <div>
            <label className="field-label">Max HP</label>
            <input type="number" value={player.maxHp} min={1}
              onChange={(e) => update('maxHp', parseInt(e.target.value) || 1)}
              disabled={!canEdit} />
          </div>
          <div>
            <label className="field-label">Temp HP</label>
            <input type="number" value={player.tempHp} min={0}
              onChange={(e) => update('tempHp', parseInt(e.target.value) || 0)}
              disabled={!canEdit} />
          </div>
        </div>
      </div>

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
          <StatBox label="Prof Bonus" value={player.proficiencyBonus} editable={canEdit}
            onChange={(v) => update('proficiencyBonus', v)} min={2} max={6} />
          <StatBox label="Passive Perc" value={player.passivePerception} editable={canEdit}
            onChange={(v) => update('passivePerception', v)} min={1} max={30} />
          <StatBox label="Passive Inv" value={player.passiveInvestigation} editable={canEdit}
            onChange={(v) => update('passiveInvestigation', v)} min={1} max={30} />
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

      {/* Encumbrance */}
      {enc !== 'normal' && (
        <div className={`badge badge-${enc === 'over' ? 'danger' : 'warning'}`}
          style={{ padding: '4px 8px' }}>
          {enc === 'over' ? '⚠ Over Encumbered' : '⚡ Combat Encumbered'}
          {' '}({totalWeight.toFixed(1)} units)
        </div>
      )}

      {/* Weather & Trade */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {weather && (
          <div className="weather-display">
            <span>🌤</span>
            <span>{weather}</span>
          </div>
        )}
        {(isOwner || isGM) && onTradeClick && (
          <button className="btn btn-secondary btn-sm" onClick={onTradeClick}>
            💱 Trade
          </button>
        )}
      </div>

      {/* Conditions Strip */}
      <div>
        <div className="section-header">Conditions</div>
        <ConditionGrid
          active={player.conditions}
          onChange={(c) => update('conditions', c)}
          readonly={!canEdit}
        />
      </div>
    </div>
  );
}
