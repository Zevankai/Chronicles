import React, { useState } from 'react';
import { Item, Coins } from '../../types';
import { CoinDisplay } from '../common/CoinDisplay';

interface TradeParticipant {
  id: string;
  name: string;
  inventory: Item[];
  coins: Coins;
  type: 'player' | 'companion' | 'storage' | 'monster' | 'merchant';
}

interface TradeModalProps {
  initiator: TradeParticipant;
  target: TradeParticipant;
  /** Whether the current user is the trade initiator (left side). Defaults to true. */
  currentIsInitiator?: boolean;
  /** Whether both tokens are owned/claimed by the same player — skips dual confirmation. */
  samePlayerOwned?: boolean;
  onConfirm: (
    initiatorGives: { items: { item: Item; qty: number }[]; coins: Coins },
    targetGives: { items: { item: Item; qty: number }[]; coins: Coins }
  ) => void;
  onClose: () => void;
}

const COIN_STYLES: Record<keyof Coins, { color: string; label: string }> = {
  cp: { color: '#b87333', label: 'CP' },
  sp: { color: '#a8a9ad', label: 'SP' },
  gp: { color: '#ffd700', label: 'GP' },
  pp: { color: '#e5e4e2', label: 'PP' },
};

function ItemDetailModal({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🔍 {item.name}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {item.category} · {item.weight ?? 1}u · ×{item.quantity}
          </div>
          {item.description && (
            <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{item.description}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
            {item.damage && <div><strong>Damage:</strong> {item.damage}</div>}
            {item.hitModifier !== undefined && <div><strong>Hit Mod:</strong> {item.hitModifier >= 0 ? '+' : ''}{item.hitModifier}</div>}
            {item.damageModifier !== undefined && <div><strong>Dmg Mod:</strong> {item.damageModifier >= 0 ? '+' : ''}{item.damageModifier}</div>}
            {item.acBonus !== undefined && <div><strong>AC Bonus:</strong> +{item.acBonus}</div>}
            {item.maxCharges !== undefined && <div><strong>Charges:</strong> {item.currentCharges ?? 0}/{item.maxCharges}</div>}
            {item.value !== undefined && <div><strong>Value:</strong> {item.value} {item.valueCurrency ?? 'cp'}</div>}
          </div>
          {item.price && (
            <div style={{ fontSize: 11 }}>
              <strong>Price: </strong>
              {(['pp', 'gp', 'sp', 'cp'] as (keyof Coins)[])
                .filter((d) => item.price![d] > 0)
                .map((d) => (
                  <span key={d} style={{ color: COIN_STYLES[d].color, marginRight: 6, fontWeight: 'bold' }}>
                    {item.price![d]} {COIN_STYLES[d].label}
                  </span>
                ))}
            </div>
          )}
          {item.properties && (
            <div style={{ fontSize: 11 }}><strong>Properties:</strong> {item.properties}</div>
          )}
          {item.requiresAttunement && (
            <div style={{ fontSize: 11 }}>
              <strong>Attunement:</strong> {item.attuned ? '✦ Attuned' : '◇ Required'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TradeModal({ initiator, target, currentIsInitiator = true, samePlayerOwned = false, onConfirm, onClose }: TradeModalProps) {
  const [initiatorItems, setInitiatorItems] = useState<{ item: Item; qty: number }[]>([]);
  const [targetItems, setTargetItems] = useState<{ item: Item; qty: number }[]>([]);
  const [initiatorCoins, setInitiatorCoins] = useState<Coins>({ cp: 0, sp: 0, gp: 0, pp: 0 });
  const [targetCoins, setTargetCoins] = useState<Coins>({ cp: 0, sp: 0, gp: 0, pp: 0 });
  const [inspectItem, setInspectItem] = useState<Item | null>(null);
  const [initiatorConfirmed, setInitiatorConfirmed] = useState(false);
  const [targetConfirmed, setTargetConfirmed] = useState(false);

  const addItem = (
    item: Item,
    setItems: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>,
    items: { item: Item; qty: number }[]
  ) => {
    setInitiatorConfirmed(false);
    setTargetConfirmed(false);
    const existing = items.find((x) => x.item.id === item.id);
    if (existing) {
      setItems(items.map((x) => x.item.id === item.id ? { ...x, qty: Math.min(x.qty + 1, item.quantity) } : x));
    } else {
      setItems([...items, { item, qty: 1 }]);
    }
  };

  const removeItem = (
    itemId: string,
    setItems: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>,
    items: { item: Item; qty: number }[]
  ) => {
    setInitiatorConfirmed(false);
    setTargetConfirmed(false);
    setItems(items.filter((x) => x.item.id !== itemId));
  };

  const handleCoinsChange = (
    coins: Coins,
    setCoins: React.Dispatch<React.SetStateAction<Coins>>
  ) => {
    setInitiatorConfirmed(false);
    setTargetConfirmed(false);
    setCoins(coins);
  };

  const handleConfirm = () => {
    onConfirm(
      { items: initiatorItems, coins: initiatorCoins },
      { items: targetItems, coins: targetCoins }
    );
  };

  const bothConfirmed = initiatorConfirmed && targetConfirmed;
  // For merchant trades or same-player trades, we don't need dual confirmation
  const isMerchantTrade = target.type === 'merchant';
  const needsDualConfirmation = !isMerchantTrade && !samePlayerOwned;

  const renderCoins = (coins: Coins) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
      {(['pp', 'gp', 'sp', 'cp'] as (keyof Coins)[]).map((denom) => (
        <div key={denom} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: COIN_STYLES[denom].color,
            textShadow: '0 0 4px rgba(0,0,0,0.5)',
          }}>
            {coins[denom]}
          </div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: 1 }}>
            {COIN_STYLES[denom].label}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSide = (
    participant: TradeParticipant,
    items: { item: Item; qty: number }[],
    setItems: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>,
    coins: Coins,
    setCoins: React.Dispatch<React.SetStateAction<Coins>>,
    isMySide: boolean,
    confirmed: boolean,
    onToggleConfirm: () => void
  ) => {
    // For merchant trades: both sides are interactive (player can pick merchant items to buy)
    // For same-player trades: both sides are interactive
    const canInteract = isMySide || isMerchantTrade || samePlayerOwned;
    const sideLabel = isMerchantTrade
      ? (isMySide ? 'Your items to sell:' : 'Click item to select for purchase:')
      : (canInteract ? 'Click item to offer:' : 'View only (🔍 to inspect):');
    return (
      <div className="trade-participant">
        <div className="section-header">{participant.name}</div>

        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>
          {sideLabel}
        </div>

        {/* Source inventory */}
        <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
          {participant.inventory.map((item) => {
            const isSelected = items.some((x) => x.item.id === item.id);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2px 4px',
                  borderRadius: 3,
                  fontSize: 12,
                  background: isSelected ? 'rgba(120,80,30,0.15)' : 'var(--color-bg)',
                  marginBottom: 2,
                  cursor: canInteract ? 'pointer' : 'default',
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                }}
                onClick={canInteract ? () => addItem(item, setItems, items) : undefined}
              >
                <span
                  style={{
                    flex: 1,
                    color: canInteract ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                  title={canInteract ? 'Click to add to offer' : undefined}
                >
                  {isSelected && <span style={{ marginRight: 4 }}>✅</span>}
                  {item.name}
                </span>
                <span className="text-muted" style={{ marginRight: 4 }}>×{item.quantity}</span>
                <button
                  className="btn-icon"
                  title="Inspect item"
                  style={{ fontSize: 11 }}
                  onClick={(e) => { e.stopPropagation(); setInspectItem(item); }}
                >
                  🔍
                </button>
              </div>
            );
          })}
          {participant.inventory.length === 0 && (
            <div className="text-muted" style={{ fontSize: 11 }}>No items</div>
          )}
        </div>

        {/* Offered items */}
        <div className="field-label">{isMerchantTrade && !isMySide ? 'Selected to purchase:' : 'Offering:'}</div>
        {items.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 11 }}>Nothing</div>
        ) : (
          items.map((x) => (
            <div key={x.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <span>{x.item.name} ×{x.qty}</span>
              <div style={{ display: 'flex', gap: 2 }}>
                <button className="btn-icon" style={{ fontSize: 11 }} onClick={() => setInspectItem(x.item)}>🔍</button>
                {canInteract && (
                  <button className="btn-icon" onClick={() => removeItem(x.item.id, setItems, items)}>✕</button>
                )}
              </div>
            </div>
          ))
        )}

        {canInteract && (
          <div style={{ marginTop: 6 }}>
            <div className="field-label">Coins to offer:</div>
            {renderCoins(coins)}
            <CoinDisplay coins={coins} onChange={(c) => handleCoinsChange(c, setCoins)} />
          </div>
        )}
        {!canInteract && coins && (
          <div style={{ marginTop: 6 }}>
            <div className="field-label">Coins offered:</div>
            {renderCoins(coins)}
          </div>
        )}

        {/* Per-side confirmation — only shown for standard player-to-player trades */}
        {needsDualConfirmation && (
          <div style={{ marginTop: 8, borderTop: '1px solid var(--color-border-light)', paddingTop: 6 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: isMySide ? 'pointer' : 'not-allowed',
              fontSize: 12,
              color: confirmed ? 'var(--color-success)' : 'var(--color-text)',
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={isMySide ? onToggleConfirm : undefined}
                disabled={!isMySide}
              />
              {confirmed ? '✅ Confirmed' : isMySide ? 'Confirm offer' : '🔒 Waiting for other party'}
            </label>
          </div>
        )}
      </div>
    );
  };

  const canExecute = needsDualConfirmation ? bothConfirmed : true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">💱 Trade{isMerchantTrade ? ` — ${target.name}` : ''}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {isMerchantTrade && (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, padding: '4px 0', borderBottom: '1px solid var(--color-border-light)' }}>
            🛒 Select items from the merchant to purchase, and your own items to sell. Then click <strong>Confirm Trade</strong> to submit for GM approval.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 12, alignItems: 'start' }}>
          {renderSide(
            initiator, initiatorItems, setInitiatorItems,
            initiatorCoins, setInitiatorCoins,
            currentIsInitiator,
            initiatorConfirmed,
            () => setInitiatorConfirmed((v) => !v)
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, paddingTop: 40 }}>⇌</div>
          {renderSide(
            target, targetItems, setTargetItems,
            targetCoins, setTargetCoins,
            !currentIsInitiator,
            targetConfirmed,
            () => setTargetConfirmed((v) => !v)
          )}
        </div>

        {needsDualConfirmation && !bothConfirmed && (
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Both parties must confirm before the trade can be executed.
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!canExecute}
            title={!canExecute ? 'Both parties must confirm' : undefined}
          >
            {isMerchantTrade ? '🛒 Confirm Trade' : 'Execute Trade'}
          </button>
        </div>
      </div>

      {/* Item inspector modal */}
      {inspectItem && (
        <ItemDetailModal item={inspectItem} onClose={() => setInspectItem(null)} />
      )}
    </div>
  );
}
