import React from 'react';
import { Coins } from '../../types';

interface CoinDisplayProps {
  coins: Coins;
  onChange?: (coins: Coins) => void;
  readonly?: boolean;
}

export function CoinDisplay({ coins, onChange, readonly = false }: CoinDisplayProps) {
  const update = (key: keyof Coins, val: string) => {
    onChange?.({ ...coins, [key]: parseInt(val) || 0 });
  };

  return (
    <div className="coins-grid">
      {(['cp', 'sp', 'gp', 'pp'] as const).map((type) => (
        <div key={type} className={`coin-box ${type}`}>
          <span className="coin-label">{type.toUpperCase()}</span>
          {readonly ? (
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>{coins[type]}</span>
          ) : (
            <input
              type="number"
              min={0}
              value={coins[type]}
              onChange={(e) => update(type, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
