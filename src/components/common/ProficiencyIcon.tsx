import React from 'react';
import { ProficiencyLevel } from '../../types';

interface ProficiencyIconProps {
  level: ProficiencyLevel;
  onClick?: () => void;
}

const PROF_LABELS: Record<ProficiencyLevel, string> = {
  none: '○',
  half: '◑',
  proficient: '●',
  expertise: '★',
};

export function ProficiencyIcon({ level, onClick }: ProficiencyIconProps) {
  return (
    <span
      className={`prof-icon ${level}`}
      onClick={onClick}
      title={level}
    >
      {PROF_LABELS[level]}
    </span>
  );
}
