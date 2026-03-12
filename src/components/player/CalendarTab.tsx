import React from 'react';
import { CalendarConfig, WeatherData } from '../../types';
import { formatCalendarDate, formatTime, getSeason, advanceCalendar } from '../../utils';

interface CalendarTabProps {
  calendar: CalendarConfig;
  weather?: WeatherData;
  onCalendarChange?: (calendar: CalendarConfig) => void;
  isGM: boolean;
}

export function CalendarTab({ calendar, weather, onCalendarChange, isGM }: CalendarTabProps) {
  const dateStr = formatCalendarDate(calendar);
  const timeStr = formatTime(calendar.currentHour, calendar.currentMinute);
  const season = getSeason(calendar);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Date/Time Display */}
      <div className="calendar-widget">
        <div className="calendar-date">{dateStr}</div>
        <div className="calendar-time">{timeStr}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Season: {season}</div>
      </div>

      {/* Weather */}
      {weather && (
        <div className="card">
          <div className="section-header">Current Weather</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <span className="field-label">Conditions</span>
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>{weather.type}</div>
            </div>
            <div>
              <span className="field-label">Temperature</span>
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>{weather.temperature}°C</div>
            </div>
            <div>
              <span className="field-label">Wind Speed</span>
              <div style={{ fontSize: 14 }}>{weather.windSpeed} km/h</div>
            </div>
            <div>
              <span className="field-label">Humidity</span>
              <div style={{ fontSize: 14 }}>{weather.humidity}%</div>
            </div>
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 2, 4, 8, 12, 24].map((h) => (
              <button
                key={h}
                className="btn btn-sm btn-secondary"
                onClick={() => onCalendarChange(advanceCalendar(calendar, h))}
              >
                +{h}h
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
