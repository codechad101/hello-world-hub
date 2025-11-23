// Technical Indicators for ML Training
export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface TrainingFeatures {
  rsi: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  volumeRatio: number;
  priceChange: number;
  volatility: number;
}

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
};

// Calculate MACD (Moving Average Convergence Divergence)
export const calculateMACD = (
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number } => {
  if (prices.length < slowPeriod) {
    return { macd: 0, signal: 0 };
  }

  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  const macd = emaFast - emaSlow;

  // For signal line, we'd need to calculate EMA of MACD values
  // Simplified version here
  const signal = macd * 0.9; // Approximation

  return { macd, signal };
};

// Calculate EMA (Exponential Moving Average)
export const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
};

// Calculate SMA (Simple Moving Average)
export const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;

  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
};

// Calculate Volatility (Standard Deviation)
export const calculateVolatility = (prices: number[], period: number = 20): number => {
  if (prices.length < period) return 0;

  const slice = prices.slice(-period);
  const mean = slice.reduce((sum, price) => sum + price, 0) / period;
  const squaredDiffs = slice.map((price) => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;

  return Math.sqrt(variance);
};

// Extract all features for ML training
export const extractFeatures = (candles: CandleData[]): TrainingFeatures => {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);

  const rsi = calculateRSI(closes);
  const { macd, signal } = calculateMACD(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const volatility = calculateVolatility(closes);

  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const currentVolume = volumes[volumes.length - 1] || 0;
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;

  const priceChange =
    closes.length > 1 ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : 0;

  return {
    rsi,
    macd,
    macdSignal: signal,
    sma20,
    sma50,
    volumeRatio,
    priceChange,
    volatility,
  };
};

// Generate trading signal based on features
export const generateSignal = (
  features: TrainingFeatures
): { signal: "BUY" | "SELL" | "HOLD"; confidence: number } => {
  let bullishScore = 0;
  let bearishScore = 0;

  // RSI signals
  if (features.rsi < 30) bullishScore += 2; // Oversold
  if (features.rsi > 70) bearishScore += 2; // Overbought

  // MACD signals
  if (features.macd > features.macdSignal) bullishScore += 2;
  if (features.macd < features.macdSignal) bearishScore += 2;

  // Moving average signals
  const currentPrice = features.sma20; // Using as proxy
  if (features.sma20 > features.sma50) bullishScore += 1.5;
  if (features.sma20 < features.sma50) bearishScore += 1.5;

  // Volume signals
  if (features.volumeRatio > 1.5 && features.priceChange > 0) bullishScore += 1;
  if (features.volumeRatio > 1.5 && features.priceChange < 0) bearishScore += 1;

  // Volatility consideration
  const volatilityFactor = Math.min(features.volatility / 10, 1);

  const totalScore = bullishScore + bearishScore;
  let signal: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 50;

  if (bullishScore > bearishScore && bullishScore > 3) {
    signal = "BUY";
    confidence = Math.min(50 + (bullishScore / totalScore) * 50, 95);
  } else if (bearishScore > bullishScore && bearishScore > 3) {
    signal = "SELL";
    confidence = Math.min(50 + (bearishScore / totalScore) * 50, 95);
  }

  // Reduce confidence in high volatility
  confidence = confidence * (1 - volatilityFactor * 0.3);

  return { signal, confidence: Math.round(confidence) };
};

// Parse CSV data
export const parseCSV = (csvText: string): CandleData[] => {
  const lines = csvText.trim().split("\n");
  const candles: CandleData[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length >= 6) {
      candles.push({
        timestamp: new Date(parts[0]).getTime(),
        open: parseFloat(parts[1]),
        high: parseFloat(parts[2]),
        low: parseFloat(parts[3]),
        close: parseFloat(parts[4]),
        volume: parseFloat(parts[5]),
      });
    }
  }

  return candles;
};
