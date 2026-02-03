import React from 'react';
import './AQICard.css';

const AQI_LABELS = {
  1: { label: 'Good', class: 'good' },
  2: { label: 'Fair', class: 'fair' },
  3: { label: 'Moderate', class: 'moderate' },
  4: { label: 'Poor', class: 'poor' },
  5: { label: 'Very Poor', class: 'very-poor' },
};

export default function AQICard({ airPollution }) {
  if (!airPollution || airPollution.aqi == null || airPollution.aqi === 0) return null;

  const aqi = Math.min(5, Math.max(1, airPollution.aqi));
  const { label, class: cls } = AQI_LABELS[aqi] || AQI_LABELS[1];

  return (
    <div className={`aqi-card glass-card aqi-${cls}`}>
      <h3 className="aqi-title">Air Quality</h3>
      <div className="aqi-value-row">
        <span className="aqi-value">{aqi}</span>
        <span className="aqi-label">{label}</span>
      </div>
      <p className="aqi-desc">
        {aqi === 1 && 'Air quality is satisfactory.'}
        {aqi === 2 && 'Acceptable; some may be sensitive.'}
        {aqi === 3 && 'Sensitive groups should limit outdoor exertion.'}
        {aqi === 4 && 'Unhealthy for sensitive groups.'}
        {aqi === 5 && 'Unhealthy; consider staying indoors.'}
      </p>
    </div>
  );
}
