import React from 'react';
import { getRuleBasedAlerts } from '../utils/alertRules';
import './Alerts.css';

export default function Alerts({ current, hourly, daily }) {
  const ruleAlerts = getRuleBasedAlerts({ current, hourly, daily });
  const all = ruleAlerts.map((a) => ({ ...a, start: null, end: null, sender: null }));

  if (all.length === 0) return null;

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="alerts-card glass-card">
      <h3 className="alerts-title">Alerts</h3>
      <div className="alerts-list">
        {all.map((a, i) => (
          <div key={i} className={`alerts-item alerts-${a.severity}`}>
            <div className="alerts-item-header">
              <span className="alerts-event">{a.event}</span>
              {a.sender && <span className="alerts-sender">{a.sender}</span>}
            </div>
            <p className="alerts-desc">{a.description}</p>
            {(a.start || a.end) && (
              <p className="alerts-time">
                {a.start && formatDate(a.start)}
                {a.start && a.end && ' – '}
                {a.end && formatDate(a.end)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
