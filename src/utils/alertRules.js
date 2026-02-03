/**
 * Rule-based weather alerts (no paid API alerts).
 * Uses current + hourly/daily from free APIs.
 * @param {object} payload - { current, hourly?, daily? }
 * @returns {Array<{event: string, description: string, severity: string}>}
 */
export function getRuleBasedAlerts(payload) {
  const alerts = [];
  const current = payload?.current;
  const hourly = payload?.hourly || [];
  const daily = payload?.daily || [];

  if (!current) return alerts;

  const temp = current.temp ?? 0;
  const windSpeed = current.wind_speed ?? 0;
  const weatherMain = (current.weather && current.weather[0] && current.weather[0].main) || '';

  // Heat: temp > 35
  if (temp > 35) {
    alerts.push({
      event: 'Heat alert',
      description: `Temperature ${Math.round(temp)}°C. Stay hydrated and avoid prolonged exposure.`,
      severity: 'caution',
    });
  }

  // Strong wind: > 12 m/s
  if (windSpeed > 12) {
    alerts.push({
      event: 'Strong wind',
      description: `Wind ${Math.round(windSpeed)} m/s. Secure loose objects and use caution.`,
      severity: 'caution',
    });
  }

  // Rain: weather includes Rain OR high rain probability in next 24h
  const hasRainWeather = /rain|drizzle/i.test(weatherMain);
  const next8 = hourly.slice(0, 8);
  const maxPop = next8.reduce((acc, h) => Math.max(acc, h.pop ?? 0), 0);
  const hasRainChance = maxPop > 0;

  if (hasRainWeather || hasRainChance) {
    alerts.push({
      event: 'Carry umbrella',
      description: hasRainWeather
        ? 'Rain in the forecast. Consider carrying an umbrella.'
        : `Up to ${Math.round(maxPop * 100)}% chance of rain in the next 24 hours.`,
      severity: 'info',
    });
  }

  return alerts;
}
