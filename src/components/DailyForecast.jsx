import React from 'react';
import './DailyForecast.css';

const ICON_BASE = 'https://openweathermap.org/img/wn';

export default function DailyForecast({ daily = [], timezone, timezoneOffset, limit = 7 }) {
  const list = Array.isArray(daily) ? daily.slice(0, limit) : [];

  if (list.length === 0) return null;

  const formatDay = (dt) => {
    if (timezone) {
      return new Date(dt * 1000).toLocaleDateString(undefined, { timeZone: timezone, weekday: 'short' });
    }
    if (timezoneOffset != null) {
      return new Date((dt + timezoneOffset) * 1000).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });
    }
    return new Date(dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
  };

  return (
    <div className="daily-forecast glass-card">
      <h3 className="daily-forecast-title">5-day forecast</h3>
      <div className="daily-forecast-list">
        {list.map((day, i) => {
          const w = day.weather && day.weather[0];
          const icon = w ? `${ICON_BASE}/${w.icon}.png` : null;
          const min = Math.round(day.temp?.min ?? 0);
          const max = Math.round(day.temp?.max ?? 0);
          const pop = Math.round((day.pop ?? 0) * 100);
          return (
            <div key={day.dt ?? i} className="daily-forecast-row">
              <span className="daily-forecast-day">{formatDay(day.dt)}</span>
              {icon && <img src={icon} alt="" className="daily-forecast-icon" />}
              <span className="daily-forecast-pop">{pop > 0 ? `${pop}%` : '—'}</span>
              <span className="daily-forecast-temps">
                <span className="max">{max}°</span>
                <span className="min">{min}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
