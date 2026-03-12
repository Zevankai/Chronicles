import React from 'react';
import { getModifierString } from '../../utils';

interface StatBoxProps {
  label: string;
  value: number;
  showModifier?: boolean;
  editable?: boolean;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

export function StatBox({
  label,
  value,
  showModifier = false,
  editable = false,
  onChange,
  min = 1,
  max = 30,
}: StatBoxProps) {
  return (
    <div className="stat-box">
      <span className="stat-box-label">{label}</span>
      {editable ? (
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(parseInt(e.target.value) || 0)}
          className="stat-box-value"
        />
      ) : (
        <span className="stat-box-value">{value}</span>
      )}
      {showModifier && (
        <span className="stat-box-modifier">{getModifierString(value)}</span>
      )}
    </div>
  );
}
