import React, { useState } from 'react';
import { MerchantData, Item, ItemCategory, CalendarConfig, Coins } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { CoinDisplay } from '../common/CoinDisplay';
import { GMTab } from '../player/GMTab';
import { ITEM_CATEGORY_WEIGHTS, ITEM_CATEGORIES, COINS_TO_CP } from '../../constants';
import { generateId, coinsToCP, cpToCoins } from '../../utils';

interface MerchantTokenProps {
  merchant: MerchantData;
  onUpdate: (updated: MerchantData) => void;
  isGM: boolean;
  onBuyItem?: (item: Item, quantity: number, totalCp: number) => void;
  onSellItem?: (item: Item, quantity: number) => void;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
  playerId?: string | null;
}

function ItemEditForm({
  item,
  onChange,
  onClose,
}: {
  item: Item;
  onChange: (updated: Item) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...item });
  const priceDraft = draft.price ?? { cp: 0, sp: 0, gp: 0, pp: 0 };
  const update = <K extends keyof Item>(key: K, value: Item[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit Shop Item</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label className="field-label">Name</label>
              <input type="text" value={draft.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select value={draft.category} onChange={(e) => update('category', e.target.value as ItemCategory)}>
                {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Stock Quantity</label>
              <input type="number" value={draft.quantity} min={0}
                onChange={(e) => update('quantity', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="field-label">Weight (units)</label>
              <input type="number" value={draft.weight ?? ''} placeholder="Default" min={0} step={0.1}
                onChange={(e) => update('weight', e.target.value ? parseFloat(e.target.value) : undefined)} />
            </div>
          </div>

          {/* Multi-currency price */}
          <div>
            <label className="field-label">Price</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
              {(['pp', 'gp', 'sp', 'cp'] as (keyof Coins)[]).map((denom) => (
                <div key={denom}>
                  <label className="field-label" style={{ fontSize: 10 }}>{denom.toUpperCase()}</label>
                  <input
                    type="number"
                    value={priceDraft[denom]}
                    min={0}
                    onChange={(e) => update('price', { ...priceDraft, [denom]: parseInt(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea value={draft.description || ''} onChange={(e) => update('description', e.target.value)} rows={2} />
          </div>
          {['One-Handed Weapon', 'Two-Handed Weapon'].includes(draft.category) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <label className="field-label">Damage</label>
                <input type="text" value={draft.damage || ''} placeholder="e.g. 1d8"
                  onChange={(e) => update('damage', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Hit Modifier</label>
                <input type="number" value={draft.hitModifier ?? ''} placeholder="0"
                  onChange={(e) => update('hitModifier', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
            </div>
          )}
          {['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield'].includes(draft.category) && (
            <div>
              <label className="field-label">AC Bonus</label>
              <input type="number" value={draft.acBonus ?? ''} placeholder="0" min={0}
                onChange={(e) => update('acBonus', e.target.value ? parseInt(e.target.value) : undefined)} />
            </div>
          )}
          <div>
            <label className="field-label">Properties / Notes</label>
            <textarea value={draft.properties || ''} onChange={(e) => update('properties', e.target.value)} rows={2} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onChange(draft); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: Coins | undefined, fallbackCp: number, inflation: number): string {
  if (price) {
    const totalCp = coinsToCP(price) * inflation;
    if (totalCp === 0) return '0 cp';
    const parts: string[] = [];
    const coins = cpToCoins(Math.ceil(totalCp));
    if (coins.pp) parts.push(`${coins.pp} pp`);
    if (coins.gp) parts.push(`${coins.gp} gp`);
    if (coins.sp) parts.push(`${coins.sp} sp`);
    if (coins.cp) parts.push(`${coins.cp} cp`);
    return parts.join(' ');
  }
  // Legacy: use value in CP
  const gp = Math.ceil((fallbackCp * inflation) / COINS_TO_CP.gp);
  return `${gp} gp`;
}

function getPriceCp(item: Item, inflation: number): number {
  if (item.price) {
    return Math.ceil(coinsToCP(item.price) * inflation);
  }
  return Math.ceil((item.value || 100) * inflation);
}

export function MerchantToken({ merchant, onUpdate, isGM, onBuyItem, onSellItem, calendar, onCalendarChange, onTokenTypeChange, playerId }: MerchantTokenProps) {
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Other');

  const update = <K extends keyof MerchantData>(key: K, value: MerchantData[K]) =>
    onUpdate({ ...merchant, [key]: value });

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: Item = {
      id: generateId(),
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: 1,
      price: { cp: 0, sp: 0, gp: 10, pp: 0 },
      equipped: null,
    };
    update('inventory', [...merchant.inventory, newItem]);
    setNewItemName('');
    setNewItemCategory('Other');
  };

  const tabs = [
    { id: 'shop', label: '🛒 Shop' },
    ...(isGM ? [{ id: 'config', label: '⚙️ Config' }, { id: 'notes', label: '📝 Notes' }, { id: 'gm', label: '🔒 GM' }] : []),
  ];

  const shopPanel = (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div className="section-header">{merchant.shopName || merchant.name}</div>
        {merchant.description && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{merchant.description}</p>}
      </div>

      {merchant.inventory.map((item) => {
        const priceCp = getPriceCp(item, merchant.costInflation);
        const qty = buyQty[item.id] || 1;
        const isExpanded = expandedItemId === item.id;
        return (
          <div key={item.id} style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 4,
            padding: 6,
            marginBottom: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 'bold', color: 'var(--color-text)', textAlign: 'left' }}
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                >
                  {item.name}
                </button>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6 }}>{item.category}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-gold)', fontWeight: 'bold' }}>
                {formatPrice(item.price, item.value || 100, merchant.costInflation)}
              </span>
            </div>
            {isExpanded && (
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0' }}>
                {item.description && <div style={{ color: 'var(--color-text)', marginBottom: 4 }}>{item.description}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {item.damage && <div><strong>Damage:</strong> {item.damage}</div>}
                  {item.acBonus !== undefined && <div><strong>AC Bonus:</strong> +{item.acBonus}</div>}
                  {item.maxCharges !== undefined && <div><strong>Charges:</strong> {item.currentCharges ?? 0}/{item.maxCharges}</div>}
                </div>
                {item.properties && <div style={{ marginTop: 2 }}><strong>Properties:</strong> {item.properties}</div>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Stock: {item.quantity}</span>
              {!isGM && onBuyItem && (
                <>
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    max={item.quantity}
                    onChange={(e) => setBuyQty({ ...buyQty, [item.id]: parseInt(e.target.value) || 1 })}
                    style={{ width: 40, padding: '1px 3px', fontSize: 11 }}
                  />
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => onBuyItem(item, qty, priceCp * qty)}
                    disabled={item.quantity < qty}
                  >
                    Buy ({formatPrice(item.price, item.value || 100, merchant.costInflation)} ×{qty})
                  </button>
                </>
              )}
              {isGM && (
                <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                  <button className="btn-icon" onClick={() => setEditingItem(item)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => update('inventory', merchant.inventory.filter((i) => i.id !== item.id))}>🗑</button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isGM && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            style={{ flex: 1, minWidth: 80 }}
          />
          <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
            style={{ flex: 1, minWidth: 80 }}>
            {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-sm btn-secondary" onClick={addItem}>+ Add Item</button>
        </div>
      )}

      {/* Claim button */}
      {merchant.claimable && !isGM && (
        <div style={{ textAlign: 'center', padding: '8px 0', marginTop: 8 }}>
          {merchant.claimedBy ? (
            <div className="badge badge-success" style={{ padding: '6px 12px', display: 'inline-block', fontSize: 12 }}>
              ✅ Claimed {merchant.claimedBy === playerId ? '(by you)' : '(by another player)'}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playerId && onUpdate({ ...merchant, claimedBy: playerId })}
            >
              🏷 Claim
            </button>
          )}
        </div>
      )}

      {editingItem && (
        <ItemEditForm
          item={editingItem}
          onChange={(updated) => {
            update('inventory', merchant.inventory.map((i) => i.id === updated.id ? updated : i));
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );

  const configPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="field-label">Merchant Name</label>
          <input type="text" value={merchant.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Shop Name</label>
          <input type="text" value={merchant.shopName} onChange={(e) => update('shopName', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Cost Inflation (×)</label>
          <input type="number" value={merchant.costInflation} min={0.5} max={5} step={0.1}
            onChange={(e) => update('costInflation', parseFloat(e.target.value) || 1)} />
        </div>
        <div>
          <label className="field-label">Buyback Rate (×)</label>
          <input type="number" value={merchant.buybackRate} min={0.1} max={1} step={0.05}
            onChange={(e) => update('buybackRate', parseFloat(e.target.value) || 0.5)} />
        </div>
        <div>
          <label className="field-label">Buyback Limit (GP)</label>
          <input type="number" value={merchant.buybackLimit} min={0}
            onChange={(e) => update('buybackLimit', parseInt(e.target.value) || 0)} />
        </div>
      </div>
      <div>
        <label className="field-label">Description</label>
        <textarea value={merchant.description} onChange={(e) => update('description', e.target.value)} rows={3} />
      </div>
      <div className="section-header">Merchant Coins</div>
      <CoinDisplay coins={merchant.coins} onChange={(c) => update('coins', c)} />
    </div>
  );

  const notesPanel = (
    <div>
      <label className="field-label">GM Notes (Hidden)</label>
      <textarea value={merchant.notes} onChange={(e) => update('notes', e.target.value)} rows={8} />
    </div>
  );

  const gmTokenPanel = (
    <GMTab
      tokenType={merchant.tokenType}
      claimable={merchant.claimable}
      claimedBy={merchant.claimedBy}
      onTokenTypeChange={(t) => onTokenTypeChange?.(t)}
      onClaimableChange={(v) => onUpdate({ ...merchant, claimable: v })}
      calendar={calendar}
      onCalendarChange={onCalendarChange}
      isGM={isGM}
    />
  );

  const panels = [shopPanel];
  if (isGM) {
    panels.push(configPanel);
    panels.push(notesPanel);
    panels.push(gmTokenPanel);
  }

  return (
    <div>
      <div className="token-header">
        <div className="token-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏪</div>
        <div>
          <div className="token-name">{merchant.name}</div>
          <div className="token-subtitle">{merchant.shopName}</div>
          <div className="token-subtitle">
            {merchant.inventory.length} item(s) · ×{merchant.costInflation} cost
          </div>
        </div>
      </div>
      <TabPanel tabs={tabs} defaultTab="shop">{panels}</TabPanel>
    </div>
  );
}
