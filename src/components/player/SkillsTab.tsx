import React from 'react';
import { PlayerData } from '../../types';
import { ProficiencyIcon } from '../common/ProficiencyIcon';
import { SKILL_ATTRIBUTE_MAP, SKILL_NAMES } from '../../constants';
import { getSkillModifier, cycleProficiency } from '../../utils';

interface SkillsTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

export function SkillsTab({ player, onChange, canEdit }: SkillsTabProps) {
  const updateSkill = (name: string, key: string, value: unknown) => {
    onChange({
      ...player,
      skills: {
        ...player.skills,
        [name]: {
          ...player.skills[name as keyof typeof player.skills],
          [key]: value,
        },
      },
    });
  };

  const cycleProf = (name: string) => {
    const current = player.skills[name as keyof typeof player.skills];
    if (!canEdit || !current) return;
    updateSkill(name, 'proficiency', cycleProficiency(current.proficiency));
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 8 }}>Skills</div>
      <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr 30px 40px 40px', gap: '3px 6px', alignItems: 'center' }}>
        <span className="field-label" />
        <span className="field-label">Skill</span>
        <span className="field-label" style={{ textAlign: 'center' }}>Attr</span>
        <span className="field-label" style={{ textAlign: 'center' }}>Mod</span>
        <span className="field-label" style={{ textAlign: 'center' }}>Bonus</span>

        {SKILL_NAMES.map((name) => {
          const skillData = player.skills[name as keyof typeof player.skills];
          if (!skillData) return null;
          const attr = SKILL_ATTRIBUTE_MAP[name];
          const mod = getSkillModifier(name, player.skills, player.attributes, player.level);

          return (
            <React.Fragment key={name}>
              <ProficiencyIcon
                level={skillData.proficiency}
                onClick={() => cycleProf(name)}
              />
              <span className="skill-name" style={{ fontSize: 12 }}>{name}</span>
              <span className="skill-attr">{attr}</span>
              <span className="skill-modifier">{mod >= 0 ? `+${mod}` : mod}</span>
              <input
                type="number"
                value={skillData.bonus}
                onChange={(e) => updateSkill(name, 'bonus', parseInt(e.target.value) || 0)}
                disabled={!canEdit}
                style={{ width: '100%', padding: '1px 3px', fontSize: 11, textAlign: 'center' }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
