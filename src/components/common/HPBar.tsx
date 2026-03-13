import React, { useState, useEffect } from 'react';

interface HPBarProps {
  current: number;
  max: number;
  temp?: number;
  editable?: boolean;
  onCurrentChange?: (value: number) => void;
  onTempChange?: (value: number) => void;
}

export function HPBar({ current, max, temp = 0, editable = false, onCurrentChange, onTempChange }: HPBarProps) {
  const [editing, setEditing] = useState(false);
  const [editCurrent, setEditCurrent] = useState(current);
  const [editTemp, setEditTemp] = useState(temp);

  useEffect(() => { if (!editing) setEditCurrent(current); }, [current, editing]);
  useEffect(() => { if (!editing) setEditTemp(temp); }, [temp, editing]);

  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const status = pct > 60 ? 'healthy' : pct > 30 ? 'wounded' : 'critical';

  // Temp HP shown as blue extension beyond the main bar
  const tempPct = max > 0 ? Math.min(20, (temp / max) * 100) : 0;

  const handleClick = () => {
    if (!editable) return;
    setEditCurrent(current);
    setEditTemp(temp);
    setEditing(true);
  };

  const handleSave = () => {
    onCurrentChange?.(Math.max(0, Math.min(editCurrent, max)));
    onTempChange?.(Math.max(0, editTemp));
    setEditing(false);
  };

  return (
    <>
      <div
        className="hp-bar-container"
        onClick={handleClick}
        style={{ cursor: editable ? 'pointer' : 'default' }}
        title={editable ? 'Click to edit HP' : undefined}
      >
        <div className={`hp-bar-fill ${status}`} style={{ width: `${pct}%` }} />
        {temp > 0 && (
          <div
            className="hp-bar-fill temp"
            style={{
              left: `${pct}%`,
              width: `${tempPct}%`,
              background: 'var(--color-info)',
              position: 'absolute',
              top: 0,
              height: '100%',
              opacity: 0.8,
            }}
          />
        )}
        <span className="hp-bar-text">
          {current}/{max}{temp > 0 ? ` +${temp}` : ''}
        </span>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" style={{ maxWidth: 280 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit HP</span>
              <button className="btn-icon" onClick={() => setEditing(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <label className="field-label">Current HP</label>
                <input
                  type="number"
                  value={editCurrent}
                  min={0}
                  max={max}
                  onChange={(e) => setEditCurrent(parseInt(e.target.value) || 0)}
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label">Temp HP</label>
                <input
                  type="number"
                  value={editTemp}
                  min={0}
                  onChange={(e) => setEditTemp(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
