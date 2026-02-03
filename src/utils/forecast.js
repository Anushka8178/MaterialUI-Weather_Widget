/**
 * Helpers to build hourly slice and daily summaries from /forecast (3-hour interval) data.
 * No One Call API – uses only /data/2.5/forecast list.
 */

/**
 * Normalize a forecast list item (from /forecast) to a shape compatible with hourly UI.
 * API returns: dt, main.temp, pop, weather[]
 * @param {object} item - Raw item from forecast.list
 * @returns {object} { dt, temp, pop, weather }
 */
function normalizeForecastItem(item) {
  return {
    dt: item.dt,
    temp: item.main?.temp ?? 0,
    pop: item.pop ?? 0,
    weather: item.weather ?? [],
  };
}

/**
 * Next ~24 hours: first 8 entries from forecast.list (3h each = 24h).
 * @param {Array} forecastList - forecast.list from /data/2.5/forecast
 * @param {number} count - Number of entries (default 8)
 * @returns {Array<{dt, temp, pop, weather}>}
 */
export function getHourlySlice(forecastList, count = 8) {
  const list = Array.isArray(forecastList) ? forecastList : [];
  return list.slice(0, count).map(normalizeForecastItem);
}

/**
 * Group forecast.list by calendar date and build one summary per day:
 * - min / max temp of the day
 * - representative icon/description (entry closest to 12:00 local)
 * - max pop for the day
 * @param {Array} forecastList - forecast.list from /data/2.5/forecast
 * @returns {Array<{dt, temp: {min, max}, pop, weather}>}
 */
export function buildDailySummaries(forecastList) {
  const list = Array.isArray(forecastList) ? forecastList : [];
  if (list.length === 0) return [];

  const byDate = new Map(); // dateKey -> { min, max, entries: [{ dt, temp, pop, weather }] }

  for (const item of list) {
    const dt = item.dt;
    const d = new Date(dt * 1000);
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const temp = item.main?.temp ?? 0;
    const pop = item.pop ?? 0;
    const weather = item.weather ?? [];

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        dateKey,
        dt,
        min: temp,
        max: temp,
        pop,
        entries: [{ dt, temp, pop, weather }],
      });
    } else {
      const day = byDate.get(dateKey);
      day.min = Math.min(day.min, temp);
      day.max = Math.max(day.max, temp);
      day.pop = Math.max(day.pop, pop);
      day.entries.push({ dt, temp, pop, weather });
    }
  }

  // Build one row per day: use entry closest to 12:00 for icon/description
  const result = [];
  for (const day of byDate.values()) {
    const entries = day.entries;
    const noonTarget = 12 * 3600; // 12:00 in seconds-of-day (we use UTC hour for simplicity)
    let best = entries[0];
    let bestDiff = Math.abs((new Date(entries[0].dt * 1000).getUTCHours() * 3600) - noonTarget);
    for (let i = 1; i < entries.length; i++) {
      const h = new Date(entries[i].dt * 1000).getUTCHours() * 3600;
      const diff = Math.abs(h - noonTarget);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = entries[i];
      }
    }
    result.push({
      dt: day.dt,
      temp: { min: day.min, max: day.max },
      pop: day.pop,
      weather: best.weather,
    });
  }

  result.sort((a, b) => a.dt - b.dt);
  return result;
}
