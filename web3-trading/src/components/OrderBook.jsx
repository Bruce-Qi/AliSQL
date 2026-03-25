export default function OrderBook({ orderBook, asset }) {
  const maxTotal = Math.max(
    orderBook.asks[orderBook.asks.length - 1]?.total || 0,
    orderBook.bids[orderBook.bids.length - 1]?.total || 0
  )

  return (
    <div className="order-book">
      <h3>Order Book</h3>
      <div className="ob-header">
        <span>Price (USDT)</span>
        <span>Amount ({asset.symbol})</span>
        <span>Total</span>
      </div>
      <div className="ob-asks">
        {orderBook.asks.slice(0, 12).reverse().map((order, i) => (
          <div key={i} className="ob-row ask">
            <div
              className="ob-bar ask-bar"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price negative">{order.price.toFixed(2)}</span>
            <span className="ob-amount">{order.amount.toFixed(4)}</span>
            <span className="ob-total">{order.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
      <div className="ob-spread">
        <span className="spread-price">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className="spread-label">Spread: {((orderBook.asks[0].price - orderBook.bids[0].price) / asset.price * 100).toFixed(3)}%</span>
      </div>
      <div className="ob-bids">
        {orderBook.bids.slice(0, 12).map((order, i) => (
          <div key={i} className="ob-row bid">
            <div
              className="ob-bar bid-bar"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price positive">{order.price.toFixed(2)}</span>
            <span className="ob-amount">{order.amount.toFixed(4)}</span>
            <span className="ob-total">{order.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      <style>{`
        .order-book {
          padding: 16px;
          flex: 1;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .order-book h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .ob-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .ob-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          font-size: 12px;
          padding: 2px 0;
          position: relative;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .ob-bar {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          opacity: 0.12;
          pointer-events: none;
        }
        .ask-bar { background: var(--red); }
        .bid-bar { background: var(--green); }
        .ob-price { font-weight: 500; }
        .ob-amount { text-align: center; color: var(--text-secondary); }
        .ob-total { text-align: right; color: var(--text-secondary); }
        .positive { color: var(--green); }
        .negative { color: var(--red); }
        .ob-spread {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin: 4px 0;
        }
        .spread-price {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .spread-label {
          font-size: 11px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
