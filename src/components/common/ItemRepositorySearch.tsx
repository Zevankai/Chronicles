import React, { useState, useMemo } from 'react';
import { Item } from '../../types';
import { ITEM_REPOSITORY, ITEM_REPOSITORY_TYPES, ItemRepositoryEntry } from '../../data/itemRepository';
import { generateId } from '../../utils';

export interface ItemRepositorySearchProps {
  onAddItem: (item: Item) => void;
  disabled?: boolean;
}

/** Parse a valueText string like "25 gp", "1,500 gp", "5 sp", "4 cp" into value + currency. */
function parseValueText(valueText: string): { value?: number; valueCurrency?: 'cp' | 'sp' | 'gp' | 'pp' } {
  if (!valueText) return {};
  const match = valueText.trim().match(/^([\d,]+(?:\.\d+)?)\s*(cp|sp|gp|pp)$/i);
  if (!match) return {};
  const amount = parseFloat(match[1].replace(/,/g, ''));
  const currency = match[2].toLowerCase() as 'cp' | 'sp' | 'gp' | 'pp';
  return { value: Math.round(amount), valueCurrency: currency };
}

function entryToItem(entry: ItemRepositoryEntry): Item {
  const { itemType: _itemType, valueText, ...rest } = entry;
  const parsedValue = parseValueText(valueText);
  return {
    ...rest,
    ...parsedValue,
    id: generateId(),
    quantity: 1,
    equipped: null,
  };
}

export function ItemRepositorySearch({ onAddItem, disabled }: ItemRepositorySearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ITEM_REPOSITORY.filter((entry) => {
      const matchesName = !q || entry.name.toLowerCase().includes(q);
      const matchesType = !typeFilter || entry.itemType === typeFilter;
      return matchesName && matchesType;
    });
  }, [search, typeFilter]);

  if (!open) {
    return (
      <button
        className="btn btn-sm btn-secondary"
        onClick={() => setOpen(true)}
        disabled={disabled}
        style={{ marginTop: 4 }}
        title="Browse item catalog"
      >
        📦 Browse Items
      </button>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--color-border-light)',
      borderRadius: 6,
      background: 'var(--color-surface)',
      padding: 8,
      marginTop: 6,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span className="field-label" style={{ fontSize: 12, fontWeight: 'bold' }}>📦 Browse Items</span>
        <button className="btn-icon" onClick={() => setOpen(false)} title="Close">✕</button>
      </div>

      {/* Search controls */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: 100, fontSize: 12 }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ flex: 1, minWidth: 120, fontSize: 12 }}
        >
          <option value="">All Types</option>
          {ITEM_REPOSITORY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div style={{ maxHeight: 280, overflowY: 'auto', fontSize: 11 }}>
        {filtered.length === 0 ? (
          <div className="text-muted" style={{ textAlign: 'center', padding: '12px 0', fontSize: 12 }}>
            No items found
          </div>
        ) : (
          filtered.map((entry, idx) => (
            <div
              key={`${entry.name}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 4px',
                borderBottom: '1px solid var(--color-border-light)',
                background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-dark)',
              }}
            >
              {/* Item info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.name}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>
                  {entry.itemType} · {entry.category}
                  {entry.damage && <span style={{ marginLeft: 4, color: 'var(--color-danger)' }}>⚔ {entry.damage}</span>}
                  {entry.acBonus !== undefined && <span style={{ marginLeft: 4, color: 'var(--color-info)' }}>🛡 AC {entry.acBonus}</span>}
                  {entry.requiresAttunement && <span style={{ marginLeft: 4, color: 'var(--color-accent)' }}>✨ Attune</span>}
                </div>
                {entry.valueText && (
                  <div style={{ color: 'var(--color-gold)', fontSize: 10 }}>{entry.valueText}</div>
                )}
              </div>

              {/* Add button */}
              <button
                className="btn btn-sm btn-primary"
                style={{ flexShrink: 0, padding: '2px 8px', fontSize: 11 }}
                onClick={() => onAddItem(entryToItem(entry))}
                disabled={disabled}
              >
                Add
              </button>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 4 }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
