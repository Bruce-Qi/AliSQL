import { useState } from 'react'
import { walletAddress } from '../mockData'

export default function Header({ currentPage, onNavigate }) {
  const [connected, setConnected] = useState(false)

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo" onClick={() => onNavigate('markets')}>
          <div className="logo-icon">X</div>
          <span className="logo-text">CryptoX</span>
        </div>
        <nav className="nav">
          {['markets', 'trade', 'portfolio'].map((page) => (
            <button
              key={page}
              className={`nav-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onNavigate(page)}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      <div className="header-right">
        {connected ? (
          <div className="wallet-info">
            <span className="wallet-dot" />
            <span className="wallet-addr">{walletAddress}</span>
            <button className="btn-disconnect" onClick={() => setConnected(false)}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="btn-connect" onClick={() => setConnected(true)}>
            Connect Wallet
          </button>
        )}
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--blue);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .logo-text {
          font-weight: 700;
          font-size: 20px;
          color: var(--text-primary);
        }
        .nav {
          display: flex;
          gap: 4px;
        }
        .nav-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .nav-btn.active {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .header-right {
          display: flex;
          align-items: center;
        }
        .btn-connect {
          background: var(--blue);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }
        .btn-connect:hover {
          background: var(--blue-hover);
        }
        .wallet-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-tertiary);
          padding: 6px 12px;
          border-radius: 8px;
        }
        .wallet-dot {
          width: 8px;
          height: 8px;
          background: var(--green);
          border-radius: 50%;
        }
        .wallet-addr {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          font-family: monospace;
        }
        .btn-disconnect {
          background: none;
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          margin-left: 4px;
          transition: all 0.2s;
        }
        .btn-disconnect:hover {
          color: var(--red);
          border-color: var(--red);
        }
      `}</style>
    </header>
  )
}
