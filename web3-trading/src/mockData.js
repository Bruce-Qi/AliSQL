// Mock cryptocurrency data
export const cryptoAssets = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 67234.52, change24h: 2.34, volume: 28500000000, marketCap: 1320000000000, icon: '₿', color: '#f7931a' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -1.23, volume: 15600000000, marketCap: 415000000000, icon: 'Ξ', color: '#627eea' },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', price: 598.45, change24h: 0.87, volume: 1890000000, marketCap: 92000000000, icon: '◆', color: '#f0b90b' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', price: 178.92, change24h: 5.67, volume: 3200000000, marketCap: 78000000000, icon: '◎', color: '#9945ff' },
  { id: 'xrp', symbol: 'XRP', name: 'XRP', price: 0.6234, change24h: -0.45, volume: 1200000000, marketCap: 34000000000, icon: '✕', color: '#00aae4' },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.4567, change24h: 3.21, volume: 456000000, marketCap: 16000000000, icon: '₳', color: '#0033ad' },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change24h: -2.34, volume: 890000000, marketCap: 17600000000, icon: 'Ð', color: '#c3a634' },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', price: 7.89, change24h: 1.56, volume: 345000000, marketCap: 10500000000, icon: '●', color: '#e6007a' },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche', price: 35.67, change24h: 4.23, volume: 567000000, marketCap: 13200000000, icon: '▲', color: '#e84142' },
  { id: 'link', symbol: 'LINK', name: 'Chainlink', price: 14.56, change24h: -0.89, volume: 678000000, marketCap: 8500000000, icon: '⬡', color: '#2a5ada' },
  { id: 'matic', symbol: 'MATIC', name: 'Polygon', price: 0.7823, change24h: 2.11, volume: 345000000, marketCap: 7200000000, icon: '⬡', color: '#8247e5' },
  { id: 'uni', symbol: 'UNI', name: 'Uniswap', price: 9.87, change24h: -1.67, volume: 234000000, marketCap: 5900000000, icon: '🦄', color: '#ff007a' },
];

// Generate realistic candlestick data
export function generateCandlestickData(basePrice, days = 90) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = days; i >= 0; i--) {
    const volatility = price * 0.03;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000000 + 500000;

    data.push({
      time: Math.floor((now - i * dayMs) / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(0)),
    });

    price = close;
  }
  return data;
}

// Generate order book data
export function generateOrderBook(basePrice, depth = 20) {
  const asks = [];
  const bids = [];
  let totalAskVol = 0;
  let totalBidVol = 0;

  for (let i = 0; i < depth; i++) {
    const askPrice = basePrice * (1 + (i + 1) * 0.0005 + Math.random() * 0.0003);
    const bidPrice = basePrice * (1 - (i + 1) * 0.0005 - Math.random() * 0.0003);
    const askAmount = Math.random() * 2 + 0.1;
    const bidAmount = Math.random() * 2 + 0.1;
    totalAskVol += askAmount;
    totalBidVol += bidAmount;

    asks.push({
      price: parseFloat(askPrice.toFixed(2)),
      amount: parseFloat(askAmount.toFixed(4)),
      total: parseFloat(totalAskVol.toFixed(4)),
    });
    bids.push({
      price: parseFloat(bidPrice.toFixed(2)),
      amount: parseFloat(bidAmount.toFixed(4)),
      total: parseFloat(totalBidVol.toFixed(4)),
    });
  }

  return { asks, bids: bids };
}

// Generate recent trades
export function generateRecentTrades(basePrice, count = 30) {
  const trades = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.5;
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.002);
    const amount = Math.random() * 1.5 + 0.01;

    trades.push({
      id: i,
      price: parseFloat(price.toFixed(2)),
      amount: parseFloat(amount.toFixed(4)),
      total: parseFloat((price * amount).toFixed(2)),
      side: isBuy ? 'buy' : 'sell',
      time: new Date(now - i * Math.random() * 60000).toLocaleTimeString(),
    });
  }

  return trades;
}

// Portfolio mock data
export const portfolio = {
  totalBalance: 45678.90,
  change24h: 1234.56,
  changePercent: 2.78,
  assets: [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.5234, value: 35189.23, avgCost: 62000, pnl: 2723.31, pnlPercent: 8.39 },
    { symbol: 'ETH', name: 'Ethereum', amount: 2.145, value: 7414.54, avgCost: 3200, pnl: 550.34, pnlPercent: 8.02 },
    { symbol: 'SOL', name: 'Solana', amount: 12.5, value: 2236.50, avgCost: 150, pnl: 361.50, pnlPercent: 19.27 },
    { symbol: 'LINK', name: 'Chainlink', amount: 58.3, value: 848.95, avgCost: 12.50, pnl: 120.07, pnlPercent: 16.48 },
  ],
};

// Price history for sparklines (7 days)
export function generateSparkline(basePrice, points = 24) {
  const data = [];
  let price = basePrice * (0.95 + Math.random() * 0.1);
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * price * 0.02;
    data.push(parseFloat(price.toFixed(2)));
  }
  return data;
}

// Wallet data
export const walletAddress = '0x742d...3a4F';
export const walletBalance = {
  eth: 2.145,
  usd: 7414.54,
};

// Transaction history
export const transactions = [
  { id: 1, type: 'buy', asset: 'BTC', amount: 0.1234, price: 65432.10, total: 8074.32, time: '2024-03-15 14:23', status: 'completed' },
  { id: 2, type: 'sell', asset: 'ETH', amount: 1.5, price: 3567.89, total: 5351.84, time: '2024-03-15 12:45', status: 'completed' },
  { id: 3, type: 'buy', asset: 'SOL', amount: 10, price: 165.43, total: 1654.30, time: '2024-03-14 09:12', status: 'completed' },
  { id: 4, type: 'swap', asset: 'LINK→ETH', amount: 50, price: 14.23, total: 711.50, time: '2024-03-13 18:34', status: 'completed' },
  { id: 5, type: 'buy', asset: 'BTC', amount: 0.05, price: 64123.45, total: 3206.17, time: '2024-03-12 21:56', status: 'completed' },
  { id: 6, type: 'send', asset: 'ETH', amount: 0.5, price: 3489.12, total: 1744.56, time: '2024-03-11 16:07', status: 'completed' },
  { id: 7, type: 'receive', asset: 'USDT', amount: 5000, price: 1.00, total: 5000.00, time: '2024-03-10 10:33', status: 'completed' },
];
