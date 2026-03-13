import React, { useState } from 'react';
import { CalendarConfig, TokenType } from '../../types';

interface GMTabProps {
  tokenType: string;
  claimable?: boolean;
  claimedBy?: string;
  onTokenTypeChange: (type: string) => void;
  onClaimableChange: (value: boolean) => void;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  isGM: boolean;
  extraContent?: React.ReactNode;
}

const TOKEN_TYPES: TokenType[] = ['player', 'monster', 'companion', 'storage', 'lore', 'npc', 'merchant'];

export function GMTab({
  tokenType,
  claimable,
  claimedBy,
  onTokenTypeChange,
  onClaimableChange,
  calendar,
  onCalendarChange,
  isGM,
  extraContent,
}: GMTabProps) {
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);

  if (!isGM) return (
    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 16 }}>
      GM access required.
    </div>
  );

  const updateMonth = (index: number, field: string, value: string | number) => {
    if (!calendar || !onCalendarChange) return;
    const months = calendar.months.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onCalendarChange({ ...calendar, months });
  };

  const addMonth = () => {
    if (!calendar || !onCalendarChange) return;
    onCalendarChange({
      ...calendar,
      months: [...calendar.months, { name: 'New Month', days: 30, season: (calendar.seasons || ['Spring'])[0] }],
    });
  };

  const removeMonth = (index: number) => {
    if (!calendar || !onCalendarChange) return;
    onCalendarChange({ ...calendar, months: calendar.months.filter((_, i) => i !== index) });
  };

  const addSeason = () => {
    if (!calendar || !onCalendarChange) return;
    const seasons = [...(calendar.seasons || []), 'New Season'];
    onCalendarChange({ ...calendar, seasons });
  };

  const updateSeason = (index: number, value: string) => {
    if (!calendar || !onCalendarChange) return;
    const seasons = (calendar.seasons || []).map((s, i) => i === index ? value : s);
    onCalendarChange({ ...calendar, seasons });
  };

  const removeSeason = (index: number) => {
    if (!calendar || !onCalendarChange) return;
    const seasons = (calendar.seasons || []).filter((_, i) => i !== index);
    onCalendarChange({ ...calendar, seasons });
  };

  const updateWeekDay = (index: number, value: string) => {
    if (!calendar || !onCalendarChange) return;
    const weekDayNames = calendar.weekDayNames.map((d, i) => i === index ? value : d);
    onCalendarChange({ ...calendar, weekDayNames });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Token Type */}
      <div>
        <div className="section-header">Token Settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="field-label">Token Type</label>
            <select value={tokenType} onChange={(e) => onTokenTypeChange(e.target.value)}>
              {TOKEN_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Player Claiming</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!claimable}
                  onChange={(e) => onClaimableChange(e.target.checked)}
                />
                <span style={{ fontSize: 12 }}>Claimable</span>
              </label>
            </div>
            {claimedBy && (
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Claimed by: {claimedBy}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra content (player-specific GM fields) */}
      {extraContent}

      {/* Calendar Settings */}
      {calendar && onCalendarChange && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>Calendar Settings</div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowCalendarSettings(!showCalendarSettings)}
            >
              {showCalendarSettings ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showCalendarSettings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {/* Year suffix */}
              <div>
                <label className="field-label">Year Suffix</label>
                <input
                  type="text"
                  value={calendar.yearSuffix}
                  onChange={(e) => onCalendarChange({ ...calendar, yearSuffix: e.target.value })}
                  placeholder="e.g. A.S.C."
                />
              </div>

              {/* Days per week */}
              <div>
                <label className="field-label">Days per Week</label>
                <input
                  type="number"
                  value={calendar.daysPerWeek}
                  min={1}
                  max={14}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 7;
                    const weekDayNames = Array.from({ length: n }, (_, i) => calendar.weekDayNames[i] || `Day ${i + 1}`);
                    onCalendarChange({ ...calendar, daysPerWeek: n, weekDayNames });
                  }}
                />
              </div>

              {/* Weekday names */}
              <div>
                <div className="field-label" style={{ marginBottom: 4 }}>Day Names</div>
                {calendar.weekDayNames.map((day, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 20, textAlign: 'right' }}>{i + 1}.</span>
                    <input
                      type="text"
                      value={day}
                      onChange={(e) => updateWeekDay(i, e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
              </div>

              {/* Seasons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div className="field-label">Seasons</div>
                  <button className="btn btn-sm btn-secondary" onClick={addSeason}>+ Add</button>
                </div>
                {(calendar.seasons || []).map((season, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 3, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={season}
                      onChange={(e) => updateSeason(i, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn-icon" onClick={() => removeSeason(i)}>🗑</button>
                  </div>
                ))}
              </div>

              {/* Months */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div className="field-label">Months ({calendar.months.length})</div>
                  <button className="btn btn-sm btn-secondary" onClick={addMonth}>+ Add</button>
                </div>
                {calendar.months.map((month, i) => (
                  <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: 4, padding: 6, marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={month.name}
                        onChange={(e) => updateMonth(i, 'name', e.target.value)}
                        placeholder="Month name"
                        style={{ flex: 2 }}
                      />
                      <input
                        type="number"
                        value={month.days}
                        min={1}
                        max={99}
                        onChange={(e) => updateMonth(i, 'days', parseInt(e.target.value) || 30)}
                        style={{ width: 50 }}
                        title="Days"
                      />
                      <button className="btn-icon" onClick={() => removeMonth(i)}>🗑</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Season:</span>
                      <select
                        value={month.season || ''}
                        onChange={(e) => updateMonth(i, 'season', e.target.value)}
                        style={{ flex: 1, fontSize: 11 }}
                      >
                        <option value="">None</option>
                        {(calendar.seasons || ['Spring', 'Summer', 'Autumn', 'Winter']).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
