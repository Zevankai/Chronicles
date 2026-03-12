import React, { useState } from 'react';
import { Item, Coins } from '../../types';
import { CoinDisplay } from '../common/CoinDisplay';

interface TradeParticipant {
  id: string;
  name: string;
  inventory: Item[];
  coins: Coins;
  type: 'player' | 'companion' | 'storage' | 'monster';
}

interface TradeModalProps {
  initiator: TradeParticipant;
  target: TradeParticipant;
  onConfirm: (
    initiatorGives: { items: { item: Item; qty: number }[]; coins: Coins },
    targetGives: { items: { item: Item; qty: number }[]; coins: Coins }
  ) => void;
  onClose: () => void;
}

export function TradeModal({ initiator, target, onConfirm, onClose }: TradeModalProps) {
  const [initiatorItems, setInitiatorItems] = useState<{ item: Item; qty: number }[]>([]);
  const [targetItems, setTargetItems] = useState<{ item: Item; qty: number }[]>([]);
  const [initiatorCoins, setInitiatorCoins] = useState<Coins>({ cp: 0, sp: 0, gp: 0, pp: 0 });
  const [targetCoins, setTargetCoins] = useState<Coins>({ cp: 0, sp: 0, gp: 0, pp: 0 });

  const addItem = (
    item: Item,
    setItems: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>,
    items: { item: Item; qty: number }[]
  ) => {
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
    setItems(items.filter((x) => x.item.id !== itemId));
  };

  const handleConfirm = () => {
    onConfirm(
      { items: initiatorItems, coins: initiatorCoins },
      { items: targetItems, coins: targetCoins }
    );
  };

  const renderSide = (
    participant: TradeParticipant,
    items: { item: Item; qty: number }[],
    setItems: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>,
    coins: Coins,
    setCoins: React.Dispatch<React.SetStateAction<Coins>>
  ) => (
    <div className="trade-participant">
      <div className="section-header">{participant.name}</div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        Click item to offer:
      </div>

      {/* Source inventory */}
      <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
        {participant.inventory.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '2px 4px',
              cursor: 'pointer',
              borderRadius: 3,
              fontSize: 12,
              background: 'var(--color-bg)',
              marginBottom: 2,
            }}
            onClick={() => addItem(item, setItems, items)}
          >
            <span>{item.name}</span>
            <span className="text-muted">×{item.quantity}</span>
          </div>
        ))}
        {participant.inventory.length === 0 && (
          <div className="text-muted" style={{ fontSize: 11 }}>No items</div>
        )}
      </div>

      {/* Offered items */}
      <div className="field-label">Offering:</div>
      {items.length === 0 ? (
        <div className="text-muted" style={{ fontSize: 11 }}>Nothing</div>
      ) : (
        items.map((x) => (
          <div key={x.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
            <span>{x.item.name} ×{x.qty}</span>
            <button className="btn-icon" onClick={() => removeItem(x.item.id, setItems, items)}>✕</button>
          </div>
        ))
      )}

      <div style={{ marginTop: 6 }}>
        <div className="field-label">Coins to offer:</div>
        <CoinDisplay coins={coins} onChange={setCoins} />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">💱 Trade</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 12, alignItems: 'start' }}>
          {renderSide(initiator, initiatorItems, setInitiatorItems, initiatorCoins, setInitiatorCoins)}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, paddingTop: 40 }}>⇌</div>
          {renderSide(target, targetItems, setTargetItems, targetCoins, setTargetCoins)}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Confirm Trade</button>
        </div>
      </div>
    </div>
  );
}
