import { useState, useEffect, useRef, useMemo } from 'react'
import { createChart } from 'lightweight-charts'
import { cryptoAssets, generateCandlestickData, generateOrderBook, generateRecentTrades } from '../mockData'
import OrderBook from './OrderBook'
import TradePanel from './TradePanel'

export default function TradingView({ assetId }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const asset = cryptoAssets.find((a) => a.id === assetId) || cryptoAssets[0]
  const [timeframe, setTimeframe] = useState('1D')

  const candleData = useMemo(() => generateCandlestickData(asset.price), [asset.id])
  const orderBook = useMemo(() => generateOrderBook(asset.price), [asset.id])
  const recentTrades = useMemo(() => generateRecentTrades(asset.price), [asset.id])

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.remove()
    }

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 460,
      layout: {
        background: { color: '#1e2329' },
        textColor: '#848e9c',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#2b3139' },
        horzLines: { color: '#2b3139' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#2b3139',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#2b3139',
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    })

    candleSeries.setData(candleData)

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    volumeSeries.setData(
      candleData.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(14,203,129,0.3)' : 'rgba(246,70,93,0.3)',
      }))
    )

    chart.timeScale().fitContent()
    chartInstance.current = chart

    const handleResize = () => {
      if (chartRef.current && chartInstance.current) {
        chartInstance.current.applyOptions({ width: chartRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.current) {
        chartInstance.current.remove()
        chartInstance.current = null
      }
    }
  }, [candleData])

  const lastCandle = candleData[candleData.length - 1]
  const prevCandle = candleData[candleData.length - 2]
  const priceChange = lastCandle.close - prevCandle.close
  const priceChangePercent = (priceChange / prevCandle.close) * 100

  return (
    <div className="trading-view">
      <div className="tv-header">
        <div className="tv-pair">
          <span className="pair-icon" style={{ background: asset.color }}>{asset.icon}</span>
          <div className="pair-info">
            <h2>{asset.symbol}/USDT</h2>
            <span className="pair-name">{asset.name}</span>
          </div>
        </div>
        <div className="tv-price-info">
          <span className="tv-price">${lastCandle.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className={`tv-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="tv-stats">
          <div className="tv-stat">
            <span className="tv-stat-label">24h High</span>
            <span className="tv-stat-value">${(lastCandle.close * 1.015).toFixed(2)}</span>
          </div>
          <div className="tv-stat">
            <span className="tv-stat-label">24h Low</span>
            <span className="tv-stat-value">${(lastCandle.close * 0.978).toFixed(2)}</span>
          </div>
          <div className="tv-stat">
            <span className="tv-stat-label">24h Volume</span>
            <span className="tv-stat-value">${(asset.volume / 1e9).toFixed(2)}B</span>
          </div>
        </div>
      </div>

      <div className="tv-body">
        <div className="tv-left">
          <div className="chart-container">
            <div className="chart-toolbar">
              {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                <button
                  key={tf}
                  className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div ref={chartRef} className="chart-area" />
          </div>
          <div className="trades-section">
            <h3>Recent Trades</h3>
            <div className="trades-header">
              <span>Price (USDT)</span>
              <span>Amount ({asset.symbol})</span>
              <span>Time</span>
            </div>
            <div className="trades-list">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="trade-row">
                  <span className={trade.side === 'buy' ? 'positive' : 'negative'}>
                    {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span>{trade.amount}</span>
                  <span className="trade-time">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="tv-right">
          <OrderBook orderBook={orderBook} asset={asset} />
          <TradePanel asset={asset} currentPrice={lastCandle.close} />
        </div>
      </div>

      <style>{`
        .trading-view {
          max-width: 1600px;
          margin: 0 auto;
        }
        .tv-header {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 16px 24px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }
        .tv-pair {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pair-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }
        .pair-info h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .pair-name {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .tv-price-info {
          display: flex;
          flex-direction: column;
        }
        .tv-price {
          font-size: 24px;
          font-weight: 700;
        }
        .tv-change {
          font-size: 13px;
          font-weight: 600;
        }
        .tv-change.positive { color: var(--green); }
        .tv-change.negative { color: var(--red); }
        .tv-stats {
          display: flex;
          gap: 24px;
          margin-left: auto;
        }
        .tv-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tv-stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .tv-stat-value {
          font-size: 14px;
          font-weight: 600;
        }
        .tv-body {
          display: flex;
          gap: 0;
        }
        .tv-left {
          flex: 1;
          min-width: 0;
        }
        .tv-right {
          width: 360px;
          flex-shrink: 0;
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }
        .chart-container {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }
        .chart-toolbar {
          display: flex;
          gap: 4px;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border);
        }
        .tf-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .tf-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .tf-btn.active {
          color: var(--blue);
          background: rgba(0, 82, 255, 0.1);
        }
        .chart-area {
          width: 100%;
        }
        .trades-section {
          background: var(--bg-secondary);
          padding: 16px;
        }
        .trades-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .trades-header, .trade-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          font-size: 12px;
        }
        .trades-header {
          color: var(--text-secondary);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .trade-row {
          padding: 3px 0;
        }
        .trade-row .positive { color: var(--green); }
        .trade-row .negative { color: var(--red); }
        .trade-time { color: var(--text-secondary); text-align: right; }
        .trades-list {
          max-height: 200px;
          overflow-y: auto;
        }
        @media (max-width: 1024px) {
          .tv-body { flex-direction: column; }
          .tv-right { width: 100%; border-left: none; border-top: 1px solid var(--border); }
          .tv-header { flex-wrap: wrap; gap: 16px; }
          .tv-stats { margin-left: 0; }
        }
      `}</style>
    </div>
  )
}
