import React, { useState } from 'react';
import { PlayerData, PlayerFeature } from '../../types';
import { generateId } from '../../utils';

interface FeaturesTabProps {
  player: PlayerData;
  onChange: (updated: PlayerData) => void;
  canEdit: boolean;
}

const EMPTY_FEATURE = {
  name: '',
  description: '',
  maxCharges: 1,
  restType: 'short' as 'short' | 'long',
};

export function FeaturesTab({ player, onChange, canEdit }: FeaturesTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState({ ...EMPTY_FEATURE });

  const features = player.features ?? [];

  const updateDraft = <K extends keyof typeof EMPTY_FEATURE>(key: K, value: typeof EMPTY_FEATURE[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const updateFeature = (updated: PlayerFeature) => {
    onChange({ ...player, features: features.map((f) => (f.id === updated.id ? updated : f)) });
  };

  const addFeature = () => {
    if (!draft.name.trim()) return;
    const feature: PlayerFeature = {
      id: generateId(),
      name: draft.name.trim(),
      description: draft.description,
      maxCharges: Math.max(0, draft.maxCharges),
      currentCharges: Math.max(0, draft.maxCharges),
      restType: draft.restType,
    };
    onChange({ ...player, features: [...features, feature] });
    setDraft({ ...EMPTY_FEATURE });
    setShowAddForm(false);
  };

  const removeFeature = (id: string) => {
    onChange({ ...player, features: features.filter((f) => f.id !== id) });
  };

  const toggleCharge = (feature: PlayerFeature, chargeIndex: number) => {
    // Filled squares (index < currentCharges) are available; clicking uses one
    // Empty squares (index >= currentCharges) are used; clicking restores one
    const isAvailable = chargeIndex < feature.currentCharges;
    const newCurrent = isAvailable
      ? feature.currentCharges - 1
      : feature.currentCharges + 1;
    updateFeature({
      ...feature,
      currentCharges: Math.max(0, Math.min(feature.maxCharges, newCurrent)),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>Features &amp; Abilities</div>
        {canEdit && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setShowAddForm(true); setDraft({ ...EMPTY_FEATURE }); }}
            title="Add feature"
          >
            +
          </button>
        )}
      </div>

      {/* Add Feature Modal */}
      {showAddForm && canEdit && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">➕ Add Feature</span>
              <button className="btn-icon" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label className="field-label">Name</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => updateDraft('name', e.target.value)}
                  placeholder="Feature name"
                  autoFocus
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="field-label">Max Charges</label>
                  <input
                    type="number"
                    value={draft.maxCharges}
                    min={0}
                    onChange={(e) => updateDraft('maxCharges', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="field-label">Recharges On</label>
                  <select
                    value={draft.restType}
                    onChange={(e) => updateDraft('restType', e.target.value as 'short' | 'long')}
                  >
                    <option value="short">Short Rest</option>
                    <option value="long">Long Rest</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => updateDraft('description', e.target.value)}
                  rows={3}
                  placeholder="Describe the feature..."
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={addFeature}
                disabled={!draft.name.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features List */}
      {features.length === 0 && (
        <div className="text-muted" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
          No features added yet.{canEdit ? ' Click + to add one.' : ''}
        </div>
      )}
      {features.map((feature) => (
        <div
          key={feature.id}
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 6,
            padding: '8px 10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>{feature.name}</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0, marginLeft: 6 }}>
              <span style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface-dark)',
                padding: '1px 6px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
              }}>
                {feature.restType === 'short' ? '🌙 Short Rest' : '💤 Long Rest'}
              </span>
              {canEdit && (
                <button
                  className="btn-icon"
                  onClick={() => removeFeature(feature.id)}
                  title="Delete feature"
                  style={{ fontSize: 11 }}
                >
                  🗑
                </button>
              )}
            </div>
          </div>
          {feature.description && (
            <div style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginBottom: 8,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
            }}>
              {feature.description}
            </div>
          )}
          {feature.maxCharges > 0 && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {feature.currentCharges}/{feature.maxCharges}
              </span>
              {Array.from({ length: feature.maxCharges }).map((_, i) => {
                const isAvailable = i < feature.currentCharges;
                return (
                  <button
                    key={i}
                    onClick={() => canEdit && toggleCharge(feature, i)}
                    style={{
                      width: 18,
                      height: 18,
                      border: `2px solid var(--color-primary)`,
                      borderRadius: 3,
                      background: isAvailable ? 'var(--color-primary)' : 'transparent',
                      cursor: canEdit ? 'pointer' : 'default',
                      padding: 0,
                      flexShrink: 0,
                    }}
                    title={isAvailable ? 'Click to use charge' : 'Click to restore charge'}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
