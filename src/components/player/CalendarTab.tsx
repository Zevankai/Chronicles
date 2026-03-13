import React, { useState } from 'react';
import { CalendarConfig, WeatherData } from '../../types';
import { formatCalendarDate, formatTime, getSeason, advanceCalendar, generateWeather } from '../../utils';

interface CalendarTabProps {
  calendar: CalendarConfig;
  weather?: WeatherData;
  onCalendarChange?: (calendar: CalendarConfig) => void;
  onWeatherChange?: (weather: WeatherData) => void;
  isGM: boolean;
}

type CalView = 'info' | 'month';

export function CalendarTab({ calendar, weather, onCalendarChange, onWeatherChange, isGM }: CalendarTabProps) {
  const [view, setView] = useState<CalView>('info');
  const [editingWeather, setEditingWeather] = useState(false);
  const [weatherDraft, setWeatherDraft] = useState<WeatherData | null>(null);

  const dateStr = formatCalendarDate(calendar);
  const timeStr = formatTime(calendar.currentHour, calendar.currentMinute);
  const season = getSeason(calendar);

  const advanceAndMaybeWeather = (hours: number) => {
    if (!onCalendarChange) return;
    const prev = calendar;
    const next = advanceCalendar(calendar, hours);

    // Generate new weather if crossing a 4-hour boundary
    const prevBlock = Math.floor((prev.currentHour * 60 + prev.currentMinute) / 240);
    const nextTotalMinutes = next.currentHour * 60 + next.currentMinute;
    const nextBlock = Math.floor(nextTotalMinutes / 240);
    const dayChange = next.currentDay !== prev.currentDay || next.currentMonth !== prev.currentMonth;

    if (onWeatherChange && (nextBlock !== prevBlock || dayChange)) {
      // Need biome from room — use Temperate as default
      const newWeather = generateWeather('Temperate', next);
      onWeatherChange(newWeather);
    }

    onCalendarChange(next);
  };

  const startEditingWeather = () => {
    if (weather) {
      setWeatherDraft({ ...weather });
      setEditingWeather(true);
    }
  };

  const saveWeather = () => {
    if (weatherDraft && onWeatherChange) {
      onWeatherChange(weatherDraft);
    }
    setEditingWeather(false);
    setWeatherDraft(null);
  };

  const renderMonthlyView = () => {
    const month = calendar.months[calendar.currentMonth];
    if (!month) return null;
    const daysInMonth = month.days;
    const daysPerWeek = calendar.daysPerWeek || 7;
    const weekDayNames = calendar.weekDayNames || [];

    // Build grid
    const days: (number | null)[] = [];
    // Start from day 1 (no offset for simplicity — day 1 = first column)
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    // Pad to full rows
    while (days.length % daysPerWeek !== 0) days.push(null);

    return (
      <div>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 6 }}>
          {month.name} {calendar.currentYear} {calendar.yearSuffix}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${daysPerWeek}, 1fr)`, gap: 1, fontSize: 10 }}>
          {weekDayNames.slice(0, daysPerWeek).map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-text-muted)', padding: '2px 0' }}>
              {d.slice(0, 3)}
            </div>
          ))}
          {days.map((d, i) => (
            <div
              key={i}
              onClick={() => d && onCalendarChange && onCalendarChange({ ...calendar, currentDay: d })}
              style={{
                textAlign: 'center',
                padding: '3px 2px',
                borderRadius: 3,
                background: d === calendar.currentDay ? 'var(--color-primary)' : 'transparent',
                color: d === calendar.currentDay ? 'white' : d ? 'var(--color-text)' : 'transparent',
                cursor: d && isGM && onCalendarChange ? 'pointer' : 'default',
                border: d ? '1px solid var(--color-border-light)' : 'none',
                fontWeight: d === calendar.currentDay ? 'bold' : 'normal',
              }}
            >
              {d || ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 2 }}>
        <button className={`tab-button${view === 'info' ? ' active' : ''}`} onClick={() => setView('info')} style={{ flex: 1 }}>
          📅 Details
        </button>
        <button className={`tab-button${view === 'month' ? ' active' : ''}`} onClick={() => setView('month')} style={{ flex: 1 }}>
          🗓 Month
        </button>
      </div>

      {view === 'info' && (
        <>
          {/* Date/Time Display */}
          <div className="calendar-widget">
            <div className="calendar-date">{dateStr}</div>
            <div className="calendar-time">{timeStr}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Season: {season}</div>
          </div>

          {/* Weather */}
          {weather && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div className="section-header" style={{ marginBottom: 0 }}>Current Weather</div>
                {isGM && onWeatherChange && (
                  <button className="btn btn-sm btn-secondary" onClick={startEditingWeather}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div>
                  <span className="field-label">Conditions</span>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>{weather.type}</div>
                </div>
                <div>
                  <span className="field-label">Temperature</span>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>{weather.temperature}°F</div>
                </div>
                <div>
                  <span className="field-label">Wind Speed</span>
                  <div style={{ fontSize: 14 }}>{weather.windSpeed} mph</div>
                </div>
                <div>
                  <span className="field-label">Humidity</span>
                  <div style={{ fontSize: 14 }}>{weather.humidity}%</div>
                </div>
                {weather.description && (
                  <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    {weather.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GM Time Controls */}
          {isGM && onCalendarChange && (
            <div className="card">
              <div className="section-header">GM Time Controls</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                <div>
                  <label className="field-label">Hour (0-23)</label>
                  <input
                    type="number"
                    value={calendar.currentHour}
                    min={0}
                    max={23}
                    onChange={(e) => onCalendarChange({ ...calendar, currentHour: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="field-label">Minute</label>
                  <input
                    type="number"
                    value={calendar.currentMinute}
                    min={0}
                    max={59}
                    onChange={(e) => onCalendarChange({ ...calendar, currentMinute: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="field-label">Day</label>
                  <input
                    type="number"
                    value={calendar.currentDay}
                    min={1}
                    max={calendar.months[calendar.currentMonth]?.days || 30}
                    onChange={(e) => onCalendarChange({ ...calendar, currentDay: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="field-label">Month</label>
                  <select
                    value={calendar.currentMonth}
                    onChange={(e) => onCalendarChange({ ...calendar, currentMonth: parseInt(e.target.value) })}
                  >
                    {calendar.months.map((m, i) => (
                      <option key={i} value={i}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Year</label>
                  <input
                    type="number"
                    value={calendar.currentYear}
                    onChange={(e) => onCalendarChange({ ...calendar, currentYear: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[1, 2, 4, 8, 12, 24].map((h) => (
                  <button
                    key={h}
                    className="btn btn-sm btn-secondary"
                    onClick={() => advanceAndMaybeWeather(h)}
                  >
                    +{h}h{h === 4 ? ' 🌤' : ''}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Weather auto-generates every 4 in-game hours.
              </div>
            </div>
          )}
        </>
      )}

      {view === 'month' && renderMonthlyView()}

      {/* Weather edit modal */}
      {editingWeather && weatherDraft && (
        <div className="modal-overlay" onClick={() => setEditingWeather(false)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Weather</span>
              <button className="btn-icon" onClick={() => setEditingWeather(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label className="field-label">Type</label>
                <input type="text" value={weatherDraft.type}
                  onChange={(e) => setWeatherDraft({ ...weatherDraft, type: e.target.value as WeatherData['type'] })} />
              </div>
              <div>
                <label className="field-label">Temperature (°F)</label>
                <input type="number" value={weatherDraft.temperature}
                  onChange={(e) => setWeatherDraft({ ...weatherDraft, temperature: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="field-label">Wind Speed (mph)</label>
                <input type="number" value={weatherDraft.windSpeed} min={0}
                  onChange={(e) => setWeatherDraft({ ...weatherDraft, windSpeed: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="field-label">Humidity (%)</label>
                <input type="number" value={weatherDraft.humidity} min={0} max={100}
                  onChange={(e) => setWeatherDraft({ ...weatherDraft, humidity: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea value={weatherDraft.description} rows={2}
                  onChange={(e) => setWeatherDraft({ ...weatherDraft, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setEditingWeather(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveWeather}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
