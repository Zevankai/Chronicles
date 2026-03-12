import React from 'react';

interface HPBarProps {
  current: number;
  max: number;
  temp?: number;
}

export function HPBar({ current, max, temp = 0 }: HPBarProps) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const status = pct > 60 ? 'healthy' : pct > 30 ? 'wounded' : 'critical';

  return (
    <div className="hp-bar-container">
      <div
        className={`hp-bar-fill ${status}`}
        style={{ width: `${pct}%` }}
      />
      <span className="hp-bar-text">
        {current}/{max}{temp > 0 ? ` +${temp}` : ''}
      </span>
    </div>
  );
}
