import { useState } from 'react'

export default function TradePanel({ asset, currentPrice }) {
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('limit')
  const [price, setPrice] = useState(currentPrice.toFixed(2))
  const [amount, setAmount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [percent, setPercent] = useState(0)

  const total = (parseFloat(price || 0) * parseFloat(amount || 0)).toFixed(2)
  const balance = side === 'buy' ? '12,450.00 USDT' : `0.5234 ${asset.symbol}`

  const handlePercentClick = (p) => {
    setPercent(p)
    if (side === 'buy') {
      const maxUsdt = 12450
      const amt = (maxUsdt * p / 100) / parseFloat(price || currentPrice)
      setAmount(amt.toFixed(4))
    } else {
      const maxAsset = 0.5234
      setAmount((maxAsset * p / 100).toFixed(4))
    }
  }

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 2000)
  }

  return (
    <div className="trade-panel">
      <div className="tp-tabs">
        <button
          className={`tp-tab ${side === 'buy' ? 'buy-active' : ''}`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          className={`tp-tab ${side === 'sell' ? 'sell-active' : ''}`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <div className="tp-form">
        <div className="tp-type-tabs">
          {['limit', 'market'].map((t) => (
            <button
              key={t}
              className={`type-tab ${orderType === t ? 'active' : ''}`}
              onClick={() => setOrderType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="tp-balance">
          <span>Available</span>
          <span>{balance}</span>
        </div>

        {orderType === 'limit' && (
          <div className="tp-input-group">
            <label>Price</label>
            <div className="tp-input">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
              />
              <span className="input-suffix">USDT</span>
            </div>
          </div>
        )}

        <div className="tp-input-group">
          <label>Amount</label>
          <div className="tp-input">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              step="0.0001"
            />
            <span className="input-suffix">{asset.symbol}</span>
          </div>
        </div>

        <div className="tp-percents">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              className={`pct-btn ${percent === p ? 'active' : ''}`}
              onClick={() => handlePercentClick(p)}
            >
              {p}%
            </button>
          ))}
        </div>

        <div className="tp-total">
          <span>Total</span>
          <span>{total} USDT</span>
        </div>

        <button
          className={`tp-submit ${side}`}
          onClick={handleSubmit}
        >
          {showConfirm
            ? 'Order Placed!'
            : `${side === 'buy' ? 'Buy' : 'Sell'} ${asset.symbol}`}
        </button>
      </div>

      <style>{`
        .trade-panel {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
        }
        .tp-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .tp-tab {
          padding: 12px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .tp-tab.buy-active {
          background: var(--green-bg);
          color: var(--green);
          border-bottom: 2px solid var(--green);
        }
        .tp-tab.sell-active {
          background: var(--red-bg);
          color: var(--red);
          border-bottom: 2px solid var(--red);
        }
        .tp-form {
          padding: 16px;
        }
        .tp-type-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
        }
        .type-tab {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        }
        .type-tab.active {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .tp-balance {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .tp-input-group {
          margin-bottom: 12px;
        }
        .tp-input-group label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          display: block;
        }
        .tp-input {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0 12px;
          transition: border-color 0.2s;
        }
        .tp-input:focus-within {
          border-color: var(--blue);
        }
        .tp-input input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          padding: 10px 0;
          outline: none;
          font-family: inherit;
          width: 0;
        }
        .tp-input input::placeholder {
          color: var(--text-third);
        }
        .input-suffix {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
        }
        .tp-percents {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .pct-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pct-btn:hover {
          border-color: var(--blue);
          color: var(--text-primary);
        }
        .pct-btn.active {
          background: rgba(0, 82, 255, 0.1);
          border-color: var(--blue);
          color: var(--blue);
        }
        .tp-total {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .tp-submit {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          color: white;
          transition: opacity 0.2s;
        }
        .tp-submit:hover { opacity: 0.85; }
        .tp-submit.buy { background: var(--green); }
        .tp-submit.sell { background: var(--red); }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}
