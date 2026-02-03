/**
 * OpenWeather API service (FREE APIs only – no One Call 3.0)
 * Uses VITE_OWM_KEY from environment
 */

const BASE = 'https://api.openweathermap.org';
const GEO_BASE = 'https://api.openweathermap.org';

const geocodeCache = new Map(); // query -> locations[]

function getKey() {
  const key = import.meta.env.VITE_OWM_KEY;
  if (!key) throw new Error('Missing VITE_OWM_KEY in environment');
  return key;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJsonWithRetry(url, { retries = 2 } = {}) {
  let lastStatus = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return { res, json: await res.json() };

    lastStatus = res.status;
    // 429: rate limit (retry with backoff / Retry-After)
    if (res.status === 429 && attempt < retries) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 1200 * (attempt + 1);
      await sleep(waitMs);
      continue;
    }

    // return response for error handling
    return { res, json: await res.json().catch(() => null) };
  }
  return { res: { ok: false, status: lastStatus }, json: null };
}

/**
 * Geocoding: city name -> lat, lon
 * @param {string} query - City name (e.g. "London" or "London,UK")
 * @returns {Promise<Array<{lat: number, lon: number, name: string, country: string}>>}
 */
export async function geocode(query) {
  const raw = String(query ?? '').trim();
  if (!raw) throw new Error('City not found');

  const cacheKey = raw.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const q = encodeURIComponent(raw);
  const url = `${GEO_BASE}/geo/1.0/direct?q=${q}&limit=1&appid=${getKey()}`;
  const { res, json } = await fetchJsonWithRetry(url, { retries: 2 });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 404) throw new Error('City not found');
    if (res.status === 429) throw new Error('Geocoding rate limit exceeded');
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = json;
  if (!Array.isArray(data) || data.length === 0) throw new Error('City not found');
  const locations = data.map(({ lat, lon, name, country }) => ({ lat, lon, name, country }));
  geocodeCache.set(cacheKey, locations);
  return locations;
}

/**
 * Reverse geocoding: lat, lon -> city name
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{name: string, country: string}>}
 */
export async function reverseGeocode(lat, lon) {
  const url = `${GEO_BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${getKey()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location not found');
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Location not found');
  const { name, country } = data[0];
  return { name, country };
}

/**
 * Current weather: /data/2.5/weather
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} Normalized current (temp, feels_like, wind_speed, humidity, pressure, visibility, weather)
 */
export async function getCurrentWeather(lat, lon) {
  const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${getKey()}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 404) throw new Error('Location not found');
    throw new Error(`Weather API failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    temp: data.main?.temp ?? 0,
    feels_like: data.main?.feels_like ?? 0,
    humidity: data.main?.humidity ?? 0,
    pressure: data.main?.pressure ?? 0,
    visibility: data.visibility ?? null,
    wind_speed: data.wind?.speed ?? 0,
    wind_gust: data.wind?.gust ?? null,
    weather: data.weather ?? [],
  };
}

/**
 * 5-day / 3-hour forecast: /data/2.5/forecast
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{list: Array, city: {timezone: number}}>}
 */
export async function getForecast(lat, lon) {
  const url = `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${getKey()}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 404) throw new Error('Location not found');
    throw new Error(`Forecast API failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    list: data.list ?? [],
    city: data.city ?? {},
  };
}

/**
 * Air pollution (current)
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{aqi: number, components: object}>}
 */
export async function airPollution(lat, lon) {
  const url = `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${getKey()}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid API key');
    throw new Error(`Air pollution API failed: ${res.status}`);
  }
  const data = await res.json();
  const list = data.list && data.list[0];
  if (!list) return { aqi: 0, components: {} };
  return {
    aqi: list.main?.aqi ?? 0,
    components: list.components || {},
  };
}

/**
 * Fetch full weather for a place: geocode -> current + forecast + airPollution
 * @param {string} cityQuery - City name
 * @returns {Promise<{location, current, forecast, airPollution}>}
 */
export async function fetchWeatherByCity(cityQuery) {
  try {
    const [location] = await geocode(cityQuery);
    if (!location) throw new Error('City not found');
    return fetchWeatherByCoords(location.lat, location.lon, location.name, location.country);
  } catch (e) {
    // Fallback path when geocoding hits rate limit: use /weather?q= to get coords.
    if (e.message === 'Geocoding rate limit exceeded') {
      const raw = String(cityQuery ?? '').trim();
      if (!raw) throw e;
      const q = encodeURIComponent(raw);
      const url = `${BASE}/data/2.5/weather?q=${q}&units=metric&appid=${getKey()}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid API key');
        if (res.status === 404) throw new Error('City not found');
        throw new Error(`Weather API failed: ${res.status}`);
      }
      const data = await res.json();
      const lat = data.coord?.lat;
      const lon = data.coord?.lon;
      const name = data.name || raw;
      const country = data.sys?.country || '';
      if (lat == null || lon == null) throw e;
      return fetchWeatherByCoords(lat, lon, name, country);
    }
    throw e;
  }
}

/**
 * Fetch full weather by coordinates
 * @param {number} lat
 * @param {number} lon
 * @param {string} name - Display name
 * @param {string} country - Country code
 * @returns {Promise<{location, current, forecast, airPollution}>}
 */
export async function fetchWeatherByCoords(lat, lon, name, country) {
  const [currentData, forecastData, airData] = await Promise.all([
    getCurrentWeather(lat, lon),
    getForecast(lat, lon),
    airPollution(lat, lon).catch(() => ({ aqi: 0, components: {} })),
  ]);
  return {
    location: { name: name || 'Unknown', country: country || '', lat, lon },
    current: currentData,
    forecast: forecastData,
    airPollution: airData,
  };
}
