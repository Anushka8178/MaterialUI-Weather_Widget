import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './components/SearchBar';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AQICard from './components/AQICard';
import Alerts from './components/Alerts';
import SavedCities from './components/SavedCities';
import AnimatedBackground from './components/AnimatedBackground';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWeatherByCity, fetchWeatherByCoords, reverseGeocode } from './services/openweather';
import { addRecent, addFavorite, removeFavorite, isFavorite, getRecents, getFavorites } from './utils/storage';
import { getHourlySlice, buildDailySummaries } from './utils/forecast';
import './WeatherApp.css';

const ERROR_MESSAGES = {
  'City not found': 'City not found',
  'Location not found': 'Location not found',
  'Invalid API key': 'Invalid API key. Check VITE_OWM_KEY.',
  'Geocoding rate limit exceeded': 'Too many location requests. Please wait a bit and try again.',
  'Missing VITE_OWM_KEY in environment': 'Missing API key. Set VITE_OWM_KEY in .env',
};

function getErrorMessage(err) {
  const msg = err?.message || '';
  return ERROR_MESSAGES[msg] || msg || 'Something went wrong. Try again.';
}

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [favoritesVersion, setFavoritesVersion] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setIsDark(saved === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadWeather = useCallback(async (payload) => {
    setError(null);
    setLoading(true);
    try {
      let data;
      if (typeof payload === 'string') {
        data = await fetchWeatherByCity(payload);
      } else {
        const { lat, lon, name, country } = payload;
        data = await fetchWeatherByCoords(lat, lon, name, country);
      }
      setWeatherData(data);
      addRecent(data.location);
    } catch (e) {
      if (e.name === 'TypeError' && (e.message.includes('fetch') || e.message.includes('network'))) {
        setError('No internet connection.');
      } else {
        setError(getErrorMessage(e));
      }
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (query) => {
      if (!query?.trim()) return;
      const q = query.trim();
      // If we've already stored coordinates for this city, skip geocoding to avoid rate limits.
      const qLower = q.toLowerCase();
      const cached = [...getRecents(), ...getFavorites()].find(
        (c) => (c?.name ?? '').toLowerCase() === qLower && c?.lat != null && c?.lon != null
      );
      if (cached) {
        loadWeather({ lat: cached.lat, lon: cached.lon, name: cached.name, country: cached.country });
        return;
      }
      loadWeather(q);
    },
    [loadWeather]
  );

  const handleSelectCity = useCallback(
    (city) => {
      if (city?.lat == null || city?.lon == null) return;
      loadWeather({ lat: city.lat, lon: city.lon, name: city.name, country: city.country });
    },
    [loadWeather]
  );

  const handleLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;
      const { name, country } = await reverseGeocode(latitude, longitude);
      await loadWeather({ lat: latitude, lon: longitude, name, country });
    } catch (e) {
      if (e.code === e.PERMISSION_DENIED) setError('Location permission denied.');
      else if (e.code === e.POSITION_UNAVAILABLE) setError('Location unavailable.');
      else if (e.code === e.TIMEOUT) setError('Location request timed out.');
      else setError(getErrorMessage(e));
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [loadWeather]);

  const weatherType = weatherData?.current?.weather?.[0]?.main?.toLowerCase() || 'clear';
  const isRain = weatherType.includes('rain') || weatherType.includes('drizzle');
  const isSnow = weatherType.includes('snow');
  const isCloudy = weatherType.includes('cloud');
  const bgType = isRain ? 'rain' : isSnow ? 'snow' : isCloudy ? 'cloudy' : 'clear';

  const hourlyList = weatherData?.forecast?.list ? getHourlySlice(weatherData.forecast.list, 8) : [];
  const dailySummaries = weatherData?.forecast?.list ? buildDailySummaries(weatherData.forecast.list) : [];
  const timezoneOffset = weatherData?.forecast?.city?.timezone ?? null;

  return (
    <div className={`app-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <AnimatedBackground weatherType={bgType} />
      <ThemeToggle isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>SkyTrackr</h2>
          <p className="subtitle">Your Weather Tracker</p>
        </motion.div>

        <div className="weather-container">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
          <div className="weather-actions">
            <button
              type="button"
              className="location-btn"
              onClick={handleLocation}
              disabled={loading}
            >
              Use My Location
            </button>
          </div>

          {error && (
            <motion.div
              className="weather-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {loading && <LoadingSpinner />}

          {!loading && weatherData && (
            <motion.div
              className="weather-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="weather-main">
                <div className="weather-main-left">
                  <CurrentWeatherCard
                    current={weatherData.current}
                    location={weatherData.location}
                    timezone={null}
                    isFavorite={isFavorite(weatherData.location)}
                    onSaveCity={(location) => {
                      if (isFavorite(location)) removeFavorite(location);
                      else addFavorite(location);
                      setFavoritesVersion((v) => v + 1);
                    }}
                  />
                  <HourlyForecast
                    hourly={hourlyList}
                    timezone={null}
                    timezoneOffset={timezoneOffset}
                    limit={8}
                  />
                  <DailyForecast
                    daily={dailySummaries}
                    timezone={null}
                    timezoneOffset={timezoneOffset}
                    limit={7}
                  />
                  <AQICard airPollution={weatherData.airPollution} />
                  <Alerts
                    current={weatherData.current}
                    hourly={hourlyList}
                    daily={dailySummaries}
                  />
                </div>
                <div className="weather-main-right">
                  <SavedCities
                    currentLocation={weatherData.location}
                    onSelectCity={handleSelectCity}
                    onFavoritesChange={() => setFavoritesVersion((v) => v + 1)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !weatherData && !error && (
            <p className="weather-empty">Search for a city or use your location to see weather.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
