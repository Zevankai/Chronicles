import React from 'react';
import { ExhaustionLevel } from '../../types';
import { DEFAULT_EXHAUSTION_EFFECTS } from '../../constants';

interface ExhaustionBarProps {
  level: number;
  config?: ExhaustionLevel[];
  onChange?: (level: number) => void;
  readonly?: boolean;
}

export function ExhaustionBar({ level, config = DEFAULT_EXHAUSTION_EFFECTS, onChange, readonly = false }: ExhaustionBarProps) {
  const currentEffect = config.find((e) => e.level === level);

  return (
    <div>
      <div className="exhaustion-bar">
        {config.map((e) => (
          <div
            key={e.level}
            className={`exhaustion-pip${e.level <= level ? ' filled' : ''}`}
            title={`L${e.level}: ${e.effect}`}
            onClick={() => {
              if (!readonly) onChange?.(e.level === level ? 0 : e.level);
            }}
          />
        ))}
      </div>
      {level > 0 && (
        <div className="text-danger" style={{ fontSize: 11, marginTop: 2 }}>
          Exhaustion {level}: {currentEffect?.effect}
        </div>
      )}
    </div>
  );
}
