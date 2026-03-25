import { useState } from 'react'
import Header from './components/Header'
import MarketOverview from './components/MarketOverview'
import TradingView from './components/TradingView'
import Portfolio from './components/Portfolio'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('trade')
  const [selectedAsset, setSelectedAsset] = useState('btc')

  const handleSelectAsset = (assetId) => {
    setSelectedAsset(assetId)
    setCurrentPage('trade')
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'markets' && (
          <MarketOverview onSelectAsset={handleSelectAsset} />
        )}
        {currentPage === 'trade' && (
          <TradingView assetId={selectedAsset} />
        )}
        {currentPage === 'portfolio' && (
          <Portfolio onSelectAsset={handleSelectAsset} />
        )}
      </main>
    </div>
  )
}

export default App
