import React from 'react';
import './CurrentWeatherCard.css';

const ICON_BASE = 'https://openweathermap.org/img/wn';

export default function CurrentWeatherCard({ current, location, timezone, onSaveCity, isFavorite }) {
  if (!current || !location) return null;

  const weather = current.weather && current.weather[0];
  const icon = weather ? `${ICON_BASE}/${weather.icon}@2x.png` : null;
  const desc = weather ? weather.description : '—';
  const temp = Math.round(current.temp ?? 0);
  const feelsLike = Math.round(current.feels_like ?? 0);
  const wind = current.wind_speed ?? 0;
  const humidity = current.humidity ?? 0;
  const pressure = current.pressure ?? 0;
  const visibility = current.visibility != null ? (current.visibility / 1000).toFixed(1) : null;

  const timeStr = timezone
    ? new Date().toLocaleTimeString(undefined, { timeZone: timezone, hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveCity?.(location);
  };

  return (
    <div className="current-weather-card glass-card">
      <div className="current-weather-header">
        <div className="current-weather-location-row">
          <h2 className="current-weather-location">
            {location.name}{location.country ? `, ${location.country}` : ''}
          </h2>
          {onSaveCity && (
            <button
              type="button"
              className={`current-weather-save-star ${isFavorite ? 'active' : ''}`}
              onClick={handleSaveClick}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save city'}
              title={isFavorite ? 'Remove from favorites' : 'Save city'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          )}
        </div>
        <span className="current-weather-time">{timeStr}</span>
      </div>
      <div className="current-weather-main">
        <div className="current-weather-temp-row">
          {icon && <img src={icon} alt="" className="current-weather-icon" />}
          <div>
            <span className="current-weather-temp">{temp}°C</span>
            <p className="current-weather-desc">{desc}</p>
          </div>
        </div>
        <p className="current-weather-feels">Feels like {feelsLike}°C</p>
      </div>
      <div className="current-weather-details">
        <div className="current-weather-detail">
          <span className="label">Wind</span>
          <span className="value">{wind} m/s</span>
        </div>
        <div className="current-weather-detail">
          <span className="label">Humidity</span>
          <span className="value">{humidity}%</span>
        </div>
        <div className="current-weather-detail">
          <span className="label">Pressure</span>
          <span className="value">{pressure} hPa</span>
        </div>
        {visibility != null && (
          <div className="current-weather-detail">
            <span className="label">Visibility</span>
            <span className="value">{visibility} km</span>
          </div>
        )}
      </div>
    </div>
  );
}
