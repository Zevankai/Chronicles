import React, { useState } from 'react';
import { MerchantData, Item, CalendarConfig } from '../../types';
import { TabPanel } from '../common/TabPanel';
import { CoinDisplay } from '../common/CoinDisplay';
import { GMTab } from '../player/GMTab';
import { ITEM_CATEGORY_WEIGHTS } from '../../constants';
import { generateId } from '../../utils';

interface MerchantTokenProps {
  merchant: MerchantData;
  onUpdate: (updated: MerchantData) => void;
  isGM: boolean;
  onBuyItem?: (item: Item, quantity: number) => void;
  onSellItem?: (item: Item, quantity: number) => void;
  calendar?: CalendarConfig;
  onCalendarChange?: (cal: CalendarConfig) => void;
  onTokenTypeChange?: (type: string) => void;
}

export function MerchantToken({ merchant, onUpdate, isGM, onBuyItem, onSellItem, calendar, onCalendarChange, onTokenTypeChange }: MerchantTokenProps) {
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});
  const update = <K extends keyof MerchantData>(key: K, value: MerchantData[K]) =>
    onUpdate({ ...merchant, [key]: value });

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
        const baseValue = (item.value || 100) * merchant.costInflation;
        const qty = buyQty[item.id] || 1;
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
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{item.name}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 6 }}>{item.category}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-gold)', fontWeight: 'bold' }}>
                {Math.ceil(baseValue / 100)} gp
              </span>
            </div>
            {item.description && <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0' }}>{item.description}</p>}
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
                    onClick={() => onBuyItem(item, qty)}
                    disabled={item.quantity < qty}
                  >
                    Buy ({Math.ceil(baseValue * qty / 100)} gp)
                  </button>
                </>
              )}
              {isGM && (
                <button className="btn-icon" onClick={() => update('inventory', merchant.inventory.filter((i) => i.id !== item.id))}>🗑</button>
              )}
            </div>
          </div>
        );
      })}

      {isGM && (
        <button className="btn btn-sm btn-secondary" onClick={() => {
          const name = prompt('Item name:');
          if (name) {
            const gp = parseInt(prompt('Price in GP:') || '10') || 10;
            update('inventory', [...merchant.inventory, {
              id: generateId(),
              name,
              category: 'Other',
              quantity: 1,
              value: gp * 100,
              equipped: null,
            }]);
          }
        }}>+ Add Item to Shop</button>
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
