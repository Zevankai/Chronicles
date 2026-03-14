import React, { useState } from 'react';
import { CalendarConfig, CalendarEvent, CalendarEventType, WeatherData } from '../../types';
import { formatCalendarDate, formatTime, getSeason, advanceCalendar, generateWeather } from '../../utils';
import { generateId } from '../../utils';

interface CalendarTabProps {
  calendar: CalendarConfig;
  weather?: WeatherData;
  events?: CalendarEvent[];
  onCalendarChange?: (calendar: CalendarConfig) => void;
  onWeatherChange?: (weather: WeatherData) => void;
  onEventsChange?: (events: CalendarEvent[]) => void;
  isGM: boolean;
}

type CalView = 'info' | 'month';

const EVENT_COLORS: Record<CalendarEventType, string> = {
  session: '#3b82f6',   // Blue
  lore: '#8b5cf6',      // Purple
  holiday: '#22c55e',   // Green
  campaign: '#f59e0b',  // Gold
  other: '#e5e7eb',     // White/light gray
};

const EVENT_LABELS: Record<CalendarEventType, string> = {
  session: 'Session Start',
  lore: 'Lore',
  holiday: 'Holiday',
  campaign: 'Campaign',
  other: 'Other',
};

const EMPTY_EVENT = {
  title: '',
  type: 'session' as CalendarEventType,
  description: '',
  visibleToPlayers: true,
};

export function CalendarTab({ calendar, weather, events = [], onCalendarChange, onWeatherChange, onEventsChange, isGM }: CalendarTabProps) {
  const [view, setView] = useState<CalView>('info');
  const [viewMonth, setViewMonth] = useState<number | null>(null); // null = show current month
  const [editingWeather, setEditingWeather] = useState(false);
  const [weatherDraft, setWeatherDraft] = useState<WeatherData | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventDraft, setEventDraft] = useState({ ...EMPTY_EVENT });
  const [eventDay, setEventDay] = useState(1);
  const [showEventDetail, setShowEventDetail] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const dateStr = formatCalendarDate(calendar);
  const timeStr = formatTime(calendar.currentHour, calendar.currentMinute);
  const season = getSeason(calendar);

  // The month being viewed in the monthly view
  const displayMonthIdx = viewMonth !== null ? viewMonth : calendar.currentMonth;
  const displayMonth = calendar.months[displayMonthIdx];
  const totalMonths = calendar.months.length;

  const prevMonth = () => {
    const cur = viewMonth !== null ? viewMonth : calendar.currentMonth;
    setViewMonth((cur - 1 + totalMonths) % totalMonths);
  };
  const nextMonth = () => {
    const cur = viewMonth !== null ? viewMonth : calendar.currentMonth;
    setViewMonth((cur + 1) % totalMonths);
  };
  const goToCurrentMonth = () => setViewMonth(null);

  const advanceAndMaybeWeather = (hours: number) => {
    if (!onCalendarChange) return;
    const prev = calendar;
    const next = advanceCalendar(calendar, hours);

    const prevBlock = Math.floor((prev.currentHour * 60 + prev.currentMinute) / 240);
    const nextTotalMinutes = next.currentHour * 60 + next.currentMinute;
    const nextBlock = Math.floor(nextTotalMinutes / 240);
    const dayChange = next.currentDay !== prev.currentDay || next.currentMonth !== prev.currentMonth;

    if (onWeatherChange && (nextBlock !== prevBlock || dayChange)) {
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

  // Get events for the displayed month
  const monthEvents = events.filter((e) => {
    const monthMatch = e.month === displayMonthIdx;
    if (!monthMatch) return false;
    if (!isGM && !e.visibleToPlayers) return false;
    return true;
  });

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of monthEvents) {
    if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
    eventsByDay[ev.day].push(ev);
  }

  const addEvent = () => {
    if (!eventDraft.title.trim() || !onEventsChange) return;
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: eventDraft.title.trim(),
      type: eventDraft.type,
      month: displayMonthIdx,
      day: eventDay,
      year: calendar.currentYear,
      description: eventDraft.description,
      visibleToPlayers: eventDraft.visibleToPlayers,
    };
    onEventsChange([...events, newEvent]);
    setEventDraft({ ...EMPTY_EVENT });
    setEventDay(1);
    setShowAddEvent(false);
  };

  const saveEditedEvent = () => {
    if (!editingEvent || !onEventsChange) return;
    onEventsChange(events.map((e) => e.id === editingEvent.id ? editingEvent : e));
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    if (onEventsChange) {
      onEventsChange(events.filter((e) => e.id !== id));
    }
    setShowEventDetail(null);
  };

  const renderMonthlyView = () => {
    if (!displayMonth) return null;
    const daysInMonth = displayMonth.days;
    const daysPerWeek = calendar.daysPerWeek || 7;
    const weekDayNames = calendar.weekDayNames || [];
    const isCurrentMonth = displayMonthIdx === calendar.currentMonth;

    const days: (number | null)[] = [];
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % daysPerWeek !== 0) days.push(null);

    return (
      <div>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={prevMonth}
            style={{ minWidth: 28 }}
          >
            ‹
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {displayMonth.name} {calendar.currentYear} {calendar.yearSuffix}
            </div>
            {!isCurrentMonth && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={goToCurrentMonth}
                style={{ fontSize: 10, marginTop: 2 }}
              >
                ↩ Today
              </button>
            )}
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={nextMonth}
            style={{ minWidth: 28 }}
          >
            ›
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${daysPerWeek}, 1fr)`, gap: 1, fontSize: 10 }}>
          {weekDayNames.slice(0, daysPerWeek).map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-text-muted)', padding: '2px 0' }}>
              {d.slice(0, 3)}
            </div>
          ))}
          {days.map((d, i) => {
            const isCurrentDay = isCurrentMonth && d === calendar.currentDay;
            const dayEvents = d ? (eventsByDay[d] || []) : [];
            return (
              <div
                key={i}
                onClick={() => {
                  if (!d) return;
                  if (isGM && onCalendarChange && isCurrentMonth) {
                    onCalendarChange({ ...calendar, currentDay: d });
                  } else if (isGM && showAddEvent === false) {
                    // Allow clicking day to set event day
                    setEventDay(d);
                  }
                }}
                style={{
                  textAlign: 'center',
                  padding: '3px 2px',
                  borderRadius: 3,
                  background: isCurrentDay ? 'var(--color-primary)' : 'transparent',
                  color: isCurrentDay ? 'white' : d ? 'var(--color-text)' : 'transparent',
                  cursor: d && isGM ? 'pointer' : 'default',
                  border: d ? '1px solid var(--color-border-light)' : 'none',
                  fontWeight: isCurrentDay ? 'bold' : 'normal',
                  position: 'relative',
                  minHeight: 28,
                }}
              >
                {d || ''}
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', gap: 1, justifyContent: 'center', marginTop: 1, flexWrap: 'wrap' }}>
                    {dayEvents.slice(0, 4).map((ev) => (
                      <span
                        key={ev.id}
                        title={ev.title}
                        onClick={(e) => { e.stopPropagation(); setShowEventDetail(ev); }}
                        style={{
                          display: 'inline-block',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: EVENT_COLORS[ev.type],
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Event Legend */}
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 10 }}>
          {(Object.keys(EVENT_COLORS) as CalendarEventType[]).map((type) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: EVENT_COLORS[type], display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>{EVENT_LABELS[type]}</span>
            </div>
          ))}
        </div>

        {/* GM: Add Event button */}
        {isGM && onEventsChange && (
          <button
            className="btn btn-sm btn-secondary"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => setShowAddEvent(true)}
          >
            + Add Event
          </button>
        )}
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
        <button className={`tab-button${view === 'month' ? ' active' : ''}`} onClick={() => { setView('month'); setViewMonth(null); }} style={{ flex: 1 }}>
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

      {/* Add Event Modal */}
      {showAddEvent && isGM && (
        <div className="modal-overlay" onClick={() => setShowAddEvent(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📅 Add Calendar Event</span>
              <button className="btn-icon" onClick={() => setShowAddEvent(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label className="field-label">Title</label>
                <input type="text" value={eventDraft.title}
                  onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })}
                  placeholder="Event name" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="field-label">Type</label>
                  <select value={eventDraft.type}
                    onChange={(e) => setEventDraft({ ...eventDraft, type: e.target.value as CalendarEventType })}>
                    {(Object.keys(EVENT_LABELS) as CalendarEventType[]).map((t) => (
                      <option key={t} value={t}>{EVENT_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Day</label>
                  <input type="number" value={eventDay} min={1}
                    max={displayMonth?.days || 30}
                    onChange={(e) => setEventDay(parseInt(e.target.value) || 1)} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: EVENT_COLORS[eventDraft.type], display: 'inline-block', border: '1px solid rgba(0,0,0,0.3)' }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {EVENT_LABELS[eventDraft.type]} — {EVENT_COLORS[eventDraft.type]}
                </span>
              </div>
              <div>
                <label className="field-label">Description (optional)</label>
                <textarea value={eventDraft.description}
                  onChange={(e) => setEventDraft({ ...eventDraft, description: e.target.value })}
                  rows={2} placeholder="Optional notes..." />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                  <input type="checkbox" checked={eventDraft.visibleToPlayers}
                    onChange={(e) => setEventDraft({ ...eventDraft, visibleToPlayers: e.target.checked })} />
                  Visible to players
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowAddEvent(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addEvent} disabled={!eventDraft.title.trim()}>Add Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && (
        <div className="modal-overlay" onClick={() => setShowEventDetail(null)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: EVENT_COLORS[showEventDetail.type], display: 'inline-block' }} />
                {showEventDetail.title}
              </span>
              <button className="btn-icon" onClick={() => setShowEventDetail(null)}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              {EVENT_LABELS[showEventDetail.type]} · {calendar.months[showEventDetail.month]?.name} {showEventDetail.day}, {showEventDetail.year} {calendar.yearSuffix}
            </div>
            {showEventDetail.description && (
              <div style={{ fontSize: 12, marginBottom: 8 }}>{showEventDetail.description}</div>
            )}
            {!showEventDetail.visibleToPlayers && (
              <div style={{ fontSize: 11, color: 'var(--color-warning)' }}>🔒 GM only</div>
            )}
            {isGM && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => { setEditingEvent({ ...showEventDetail }); setShowEventDetail(null); }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteEvent(showEventDetail.id)}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && isGM && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Event</span>
              <button className="btn-icon" onClick={() => setEditingEvent(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label className="field-label">Title</label>
                <input type="text" value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="field-label">Type</label>
                  <select value={editingEvent.type}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as CalendarEventType })}>
                    {(Object.keys(EVENT_LABELS) as CalendarEventType[]).map((t) => (
                      <option key={t} value={t}>{EVENT_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Day</label>
                  <input type="number" value={editingEvent.day} min={1}
                    max={calendar.months[editingEvent.month]?.days || 30}
                    onChange={(e) => setEditingEvent({ ...editingEvent, day: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={2} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                  <input type="checkbox" checked={editingEvent.visibleToPlayers}
                    onChange={(e) => setEditingEvent({ ...editingEvent, visibleToPlayers: e.target.checked })} />
                  Visible to players
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setEditingEvent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEditedEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
