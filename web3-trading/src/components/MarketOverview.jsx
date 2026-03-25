import { useState, useMemo } from 'react'
import { cryptoAssets, generateSparkline } from '../mockData'
import SparklineChart from './SparklineChart'

export default function MarketOverview({ onSelectAsset }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('marketCap')
  const [sortDir, setSortDir] = useState('desc')

  const sparklines = useMemo(() => {
    const map = {}
    cryptoAssets.forEach((a) => {
      map[a.id] = generateSparkline(a.price)
    })
    return map
  }, [])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = cryptoAssets
    .filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      return (a[sortKey] - b[sortKey]) * mul
    })

  const fmt = (n) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    return `$${n.toLocaleString()}`
  }

  const fmtPrice = (p) => {
    if (p >= 1) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return `$${p.toFixed(4)}`
  }

  const SortIcon = ({ field }) => (
    <span className="sort-icon">{sortKey === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
  )

  return (
    <div className="market-overview">
      <div className="market-header">
        <div>
          <h1>Markets</h1>
          <p className="subtitle">Track prices and discover new assets</p>
        </div>
        <div className="search-bar">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="market-stats">
        <div className="stat-card">
          <span className="stat-label">Total Market Cap</span>
          <span className="stat-value">$2.34T</span>
          <span className="stat-change positive">+2.1%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">$89.5B</span>
          <span className="stat-change positive">+5.3%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">BTC Dominance</span>
          <span className="stat-value">52.4%</span>
          <span className="stat-change negative">-0.3%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ETH Gas</span>
          <span className="stat-value">23 Gwei</span>
          <span className="stat-change positive">Low</span>
        </div>
      </div>

      <div className="market-table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th className="th-name">Asset</th>
              <th className="th-price clickable" onClick={() => handleSort('price')}>
                Price <SortIcon field="price" />
              </th>
              <th className="th-change clickable" onClick={() => handleSort('change24h')}>
                24h Change <SortIcon field="change24h" />
              </th>
              <th className="th-chart">7D Chart</th>
              <th className="th-volume clickable" onClick={() => handleSort('volume')}>
                Volume <SortIcon field="volume" />
              </th>
              <th className="th-mcap clickable" onClick={() => handleSort('marketCap')}>
                Market Cap <SortIcon field="marketCap" />
              </th>
              <th className="th-action"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset, i) => (
              <tr key={asset.id} onClick={() => onSelectAsset(asset.id)} className="market-row">
                <td className="td-rank">{i + 1}</td>
                <td className="td-name">
                  <span className="asset-icon" style={{ background: asset.color }}>{asset.icon}</span>
                  <div>
                    <span className="asset-name">{asset.name}</span>
                    <span className="asset-symbol">{asset.symbol}</span>
                  </div>
                </td>
                <td className="td-price">{fmtPrice(asset.price)}</td>
                <td className={`td-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </td>
                <td className="td-chart">
                  <SparklineChart data={sparklines[asset.id]} positive={asset.change24h >= 0} />
                </td>
                <td className="td-volume">{fmt(asset.volume)}</td>
                <td className="td-mcap">{fmt(asset.marketCap)}</td>
                <td className="td-action">
                  <button className="trade-btn" onClick={(e) => { e.stopPropagation(); onSelectAsset(asset.id) }}>
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .market-overview {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }
        .market-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .market-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 16px;
          gap: 8px;
          width: 280px;
        }
        .search-icon { font-size: 16px; }
        .search-bar input {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          width: 100%;
          font-family: inherit;
        }
        .market-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
        }
        .stat-change {
          font-size: 13px;
          font-weight: 600;
        }
        .stat-change.positive { color: var(--green); }
        .stat-change.negative { color: var(--red); }
        .market-table-wrap {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .market-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .market-table th {
          text-align: left;
          padding: 14px 16px;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .market-table th.clickable {
          cursor: pointer;
          user-select: none;
        }
        .market-table th.clickable:hover {
          color: var(--text-primary);
        }
        .sort-icon {
          margin-left: 4px;
        }
        .market-row {
          cursor: pointer;
          transition: background 0.15s;
        }
        .market-row:hover {
          background: var(--bg-hover);
        }
        .market-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .market-row:last-child td {
          border-bottom: none;
        }
        .td-rank {
          color: var(--text-secondary);
          width: 40px;
        }
        .td-name {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .asset-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
        }
        .asset-name {
          font-weight: 600;
          display: block;
          color: var(--text-primary);
        }
        .asset-symbol {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .td-price {
          font-weight: 600;
        }
        .td-change { font-weight: 600; }
        .td-change.positive { color: var(--green); }
        .td-change.negative { color: var(--red); }
        .td-chart { width: 120px; }
        .td-volume, .td-mcap {
          color: var(--text-secondary);
        }
        .trade-btn {
          background: var(--blue);
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }
        .trade-btn:hover {
          background: var(--blue-hover);
        }
        @media (max-width: 900px) {
          .market-stats { grid-template-columns: repeat(2, 1fr); }
          .th-volume, .td-volume, .th-chart, .td-chart { display: none; }
          .market-header { flex-direction: column; gap: 16px; }
          .search-bar { width: 100%; }
        }
      `}</style>
    </div>
  )
}
