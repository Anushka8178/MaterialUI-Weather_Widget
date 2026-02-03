import React from 'react';
import './HourlyForecast.css';

const ICON_BASE = 'https://openweathermap.org/img/wn';

export default function HourlyForecast({ hourly = [], timezone, timezoneOffset, limit = 8 }) {
  const list = Array.isArray(hourly) ? hourly.slice(0, limit) : [];

  if (list.length === 0) return null;

  const formatTime = (dt) => {
    if (timezone) {
      return new Date(dt * 1000).toLocaleTimeString(undefined, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (timezoneOffset != null) {
      return new Date((dt + timezoneOffset) * 1000).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(dt * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="hourly-forecast glass-card">
      <h3 className="hourly-forecast-title">Next 24 hours</h3>
      <div className="hourly-forecast-scroll">
        {list.map((h, i) => {
          const w = h.weather && h.weather[0];
          const icon = w ? `${ICON_BASE}/${w.icon}.png` : null;
          const temp = Math.round(h.temp ?? 0);
          const pop = Math.round((h.pop ?? 0) * 100);
          return (
            <div key={h.dt ?? i} className="hourly-forecast-item">
              <span className="hourly-forecast-time">{formatTime(h.dt)}</span>
              {icon && <img src={icon} alt="" className="hourly-forecast-icon" />}
              <span className="hourly-forecast-temp">{temp}°</span>
              {pop > 0 && <span className="hourly-forecast-pop">{pop}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
