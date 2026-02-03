/**
 * Favorites and Recent Searches for SkyTrackr.
 * LocalStorage keys: skytrackr_favorites, skytrackr_recent
 *
 * City object format: { name: string, country: string, lat?: number, lon?: number }
 */

const FAVORITES_KEY = 'skytrackr_favorites';
const RECENT_KEY = 'skytrackr_recent';
const MAX_FAVORITES = 8;
const MAX_RECENT = 6;

function normalizeCity(city) {
  return {
    name: String(city?.name ?? ''),
    country: String(city?.country ?? ''),
    lat: city?.lat,
    lon: city?.lon,
  };
}

function sameCity(a, b) {
  return a?.name === b?.name && a?.country === b?.country;
}

// --- Favorites ---

/**
 * @returns {Array<{name: string, country: string, lat?: number, lon?: number}>}
 */
export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * @param {Array<{name: string, country: string, lat?: number, lon?: number}>} list
 */
export function saveFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list ?? []));
  } catch (e) {
    console.warn('saveFavorites failed', e);
  }
}

/**
 * @param {object} city - { name, country, lat?, lon? }
 * @returns {boolean} true if added, false if duplicate or at capacity
 */
export function addFavorite(city) {
  const list = getFavorites();
  const entry = normalizeCity(city);
  if (list.some((c) => sameCity(c, entry))) return false;
  if (list.length >= MAX_FAVORITES) return false;
  list.push(entry);
  saveFavorites(list);
  return true;
}

/**
 * @param {object} city - { name, country }
 * @returns {boolean} true if removed
 */
export function removeFavorite(city) {
  const list = getFavorites().filter((c) => !sameCity(c, city));
  const changed = list.length !== getFavorites().length;
  if (changed) saveFavorites(list);
  return changed;
}

/**
 * @param {object} city - { name, country }
 * @returns {boolean}
 */
export function isFavorite(city) {
  return getFavorites().some((c) => sameCity(c, city));
}

// --- Recent Searches ---

/**
 * @returns {Array<{name: string, country: string, lat?: number, lon?: number}>}
 */
export function getRecents() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * @param {Array<{name: string, country: string, lat?: number, lon?: number}>} list
 */
export function saveRecents(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list ?? []));
  } catch (e) {
    console.warn('saveRecents failed', e);
  }
}

/**
 * Add a city to recent searches. Prevents duplicates, moves to top, max 6.
 * @param {object} cityObj - { name, country, lat?, lon? }
 */
export function addRecent(cityObj) {
  const entry = normalizeCity(cityObj);
  let list = getRecents().filter((c) => !sameCity(c, entry));
  list.unshift(entry);
  list = list.slice(0, MAX_RECENT);
  saveRecents(list);
}
