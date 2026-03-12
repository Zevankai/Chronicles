import React from 'react';
import { ConditionName } from '../../types';
import { ALL_CONDITIONS } from '../../constants';

interface ConditionGridProps {
  active: ConditionName[];
  onChange?: (conditions: ConditionName[]) => void;
  readonly?: boolean;
}

export function ConditionGrid({ active, onChange, readonly = false }: ConditionGridProps) {
  const toggle = (c: ConditionName) => {
    if (readonly) return;
    const next = active.includes(c)
      ? active.filter((x) => x !== c)
      : [...active, c];
    onChange?.(next);
  };

  return (
    <div className="condition-strip">
      {ALL_CONDITIONS.map((c) => (
        <span
          key={c}
          className={`condition-badge${active.includes(c as ConditionName) ? '' : ' inactive'}`}
          onClick={() => toggle(c as ConditionName)}
          title={c}
        >
          {c}
        </span>
      ))}
    </div>
  );
}
