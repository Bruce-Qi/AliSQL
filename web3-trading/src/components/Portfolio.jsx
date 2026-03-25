import { useState } from 'react'
import { portfolio, transactions } from '../mockData'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Generate portfolio value history
const portfolioHistory = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 42000 + Math.random() * 6000 + i * 120,
}))

export default function Portfolio({ onSelectAsset }) {
  const [activeTab, setActiveTab] = useState('assets')

  const formatUsd = (n) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="portfolio">
      <div className="pf-header">
        <div className="pf-balance-card">
          <span className="pf-label">Total Balance</span>
          <h1 className="pf-total">{formatUsd(portfolio.totalBalance)}</h1>
          <div className="pf-change">
            <span className={portfolio.changePercent >= 0 ? 'positive' : 'negative'}>
              {portfolio.changePercent >= 0 ? '+' : ''}
              {formatUsd(portfolio.change24h)} ({portfolio.changePercent.toFixed(2)}%)
            </span>
            <span className="pf-period">24h</span>
          </div>
        </div>
        <div className="pf-chart-card">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0052ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#848e9c' }}
                interval="preserveStartEnd"
              />
              <YAxis
                hide
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e2329',
                  border: '1px solid #2b3139',
                  borderRadius: '8px',
                  color: '#eaecef',
                  fontSize: '13px',
                }}
                formatter={(value) => [formatUsd(value), 'Portfolio']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0052ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pf-tabs">
        <button
          className={`pf-tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
        <button
          className={`pf-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'assets' && (
        <div className="pf-assets">
          <div className="pf-assets-header">
            <span>Asset</span>
            <span>Balance</span>
            <span>Value</span>
            <span>Avg Cost</span>
            <span>PnL</span>
            <span></span>
          </div>
          {portfolio.assets.map((asset) => (
            <div key={asset.symbol} className="pf-asset-row">
              <div className="pf-asset-name">
                <span className="pf-asset-sym">{asset.symbol}</span>
                <span className="pf-asset-full">{asset.name}</span>
              </div>
              <div className="pf-asset-balance">
                <span>{asset.amount}</span>
              </div>
              <div className="pf-asset-value">
                <span>{formatUsd(asset.value)}</span>
              </div>
              <div className="pf-asset-cost">
                <span>{formatUsd(asset.avgCost)}</span>
              </div>
              <div className={`pf-asset-pnl ${asset.pnl >= 0 ? 'positive' : 'negative'}`}>
                <span>{asset.pnl >= 0 ? '+' : ''}{formatUsd(asset.pnl)}</span>
                <span className="pnl-pct">({asset.pnlPercent.toFixed(2)}%)</span>
              </div>
              <div>
                <button
                  className="trade-asset-btn"
                  onClick={() => onSelectAsset(asset.symbol.toLowerCase())}
                >
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="pf-history">
          <div className="pf-history-header">
            <span>Type</span>
            <span>Asset</span>
            <span>Amount</span>
            <span>Price</span>
            <span>Total</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {transactions.map((tx) => (
            <div key={tx.id} className="pf-tx-row">
              <span className={`tx-type ${tx.type}`}>
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </span>
              <span className="tx-asset">{tx.asset}</span>
              <span>{tx.amount}</span>
              <span>{formatUsd(tx.price)}</span>
              <span>{formatUsd(tx.total)}</span>
              <span className="tx-time">{tx.time}</span>
              <span className="tx-status">{tx.status}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .portfolio {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        .pf-header {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .pf-balance-card, .pf-chart-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }
        .pf-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pf-total {
          font-size: 36px;
          font-weight: 700;
          margin: 8px 0;
        }
        .pf-change {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pf-change .positive { color: var(--green); font-weight: 600; font-size: 14px; }
        .pf-change .negative { color: var(--red); font-weight: 600; font-size: 14px; }
        .pf-period {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .pf-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
        }
        .pf-tab {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .pf-tab:hover {
          color: var(--text-primary);
        }
        .pf-tab.active {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        .pf-assets, .pf-history {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .pf-assets-header, .pf-asset-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr 0.7fr;
          align-items: center;
          padding: 12px 20px;
          font-size: 13px;
        }
        .pf-assets-header {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }
        .pf-asset-row {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .pf-asset-row:last-child {
          border-bottom: none;
        }
        .pf-asset-row:hover {
          background: var(--bg-hover);
        }
        .pf-asset-sym {
          font-weight: 700;
          font-size: 14px;
          display: block;
        }
        .pf-asset-full {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .pf-asset-pnl.positive { color: var(--green); font-weight: 600; }
        .pf-asset-pnl.negative { color: var(--red); font-weight: 600; }
        .pnl-pct {
          font-size: 11px;
          margin-left: 4px;
          opacity: 0.8;
        }
        .trade-asset-btn {
          background: var(--blue);
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .trade-asset-btn:hover {
          background: var(--blue-hover);
        }
        .pf-history-header, .pf-tx-row {
          display: grid;
          grid-template-columns: 0.8fr 0.8fr 0.8fr 1fr 1fr 1.2fr 0.8fr;
          align-items: center;
          padding: 10px 20px;
          font-size: 13px;
        }
        .pf-history-header {
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }
        .pf-tx-row {
          border-bottom: 1px solid var(--border);
        }
        .pf-tx-row:last-child { border-bottom: none; }
        .tx-type {
          font-weight: 600;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 4px;
          text-align: center;
          width: fit-content;
        }
        .tx-type.buy { color: var(--green); background: var(--green-bg); }
        .tx-type.sell { color: var(--red); background: var(--red-bg); }
        .tx-type.swap { color: var(--blue); background: rgba(0,82,255,0.1); }
        .tx-type.send { color: var(--yellow); background: rgba(240,185,11,0.1); }
        .tx-type.receive { color: var(--green); background: var(--green-bg); }
        .tx-time { color: var(--text-secondary); font-size: 12px; }
        .tx-status {
          color: var(--green);
          font-size: 12px;
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .pf-header { grid-template-columns: 1fr; }
          .pf-assets-header, .pf-asset-row { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
          .pf-assets-header span:nth-child(4),
          .pf-asset-row > div:nth-child(4),
          .pf-assets-header span:nth-child(6),
          .pf-asset-row > div:nth-child(6) { display: none; }
          .pf-history-header, .pf-tx-row { font-size: 11px; }
        }
      `}</style>
    </div>
  )
}
