// Futures Prediction Utilities with ML Integration
// Advanced predictive models for futures trading

import { 
  FuturesHistoricalData, 
  FuturesContract 
} from "@/services/futuresAPI";
import { 
  calculateRSI, 
  calculateMACD, 
  calculateSMA, 
  calculateEMA,
  calculateVolatility 
} from "./mlTraining";

export interface FuturesPrediction {
  symbol: string;
  prediction: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  entryPrice: number;
  timeHorizon: "INTRADAY" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
  riskReward: number;
  signals: {
    technical: number;
    momentum: number;
    volume: number;
    trend: number;
  };
  reasoning: string[];
}

export interface PredictionFeatures {
  // Price-based features
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  
  // Volatility features
  volatility: number;
  atr: number; // Average True Range
  bollingerUpper: number;
  bollingerLower: number;
  bollingerWidth: number;
  
  // Volume features
  volumeMA: number;
  volumeRatio: number;
  obv: number; // On Balance Volume
  
  // Momentum features
  roc: number; // Rate of Change
  stochastic: number;
  williamsR: number;
  
  // Trend features
  adx: number; // Average Directional Index
  trendStrength: number;
  
  // Open Interest features (futures-specific)
  oiChange: number;
  oiTrend: number;
}

// Calculate Advanced Technical Indicators
export const calculateAdvancedIndicators = (
  data: FuturesHistoricalData[]
): PredictionFeatures => {
  const closes = data.map((d) => d.close);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const volumes = data.map((d) => d.volume);
  const ois = data.map((d) => d.openInterest);

  // Basic indicators
  const rsi = calculateRSI(closes, 14);
  const { macd, signal } = calculateMACD(closes, 12, 26, 9);
  const macdHistogram = macd - signal;
  
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  // Volatility indicators
  const volatility = calculateVolatility(closes, 20);
  const atr = calculateATR(highs, lows, closes, 14);
  const { upper, lower, width } = calculateBollingerBands(closes, 20, 2);
  
  // Volume indicators
  const volumeMA = calculateSMA(volumes, 20);
  const currentVolume = volumes[volumes.length - 1] || 0;
  const volumeRatio = volumeMA > 0 ? currentVolume / volumeMA : 1;
  const obv = calculateOBV(closes, volumes);
  
  // Momentum indicators
  const roc = calculateROC(closes, 12);
  const stochastic = calculateStochastic(highs, lows, closes, 14);
  const williamsR = calculateWilliamsR(highs, lows, closes, 14);
  
  // Trend indicators
  const adx = calculateADX(highs, lows, closes, 14);
  const trendStrength = calculateTrendStrength(closes, sma50, sma200);
  
  // Futures-specific: Open Interest
  const oiChange = ois.length > 1 ? 
    ((ois[ois.length - 1] - ois[ois.length - 2]) / ois[ois.length - 2]) * 100 : 0;
  const oiTrend = calculateSMA(ois, 5);

  return {
    rsi,
    macd,
    macdSignal: signal,
    macdHistogram,
    sma20,
    sma50,
    sma200,
    ema12,
    ema26,
    volatility,
    atr,
    bollingerUpper: upper,
    bollingerLower: lower,
    bollingerWidth: width,
    volumeMA,
    volumeRatio,
    obv,
    roc,
    stochastic,
    williamsR,
    adx,
    trendStrength,
    oiChange,
    oiTrend,
  };
};

// Calculate ATR (Average True Range)
const calculateATR = (highs: number[], lows: number[], closes: number[], period: number): number => {
  if (highs.length < period + 1) return 0;
  
  const trueRanges: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges, period);
};

// Calculate Bollinger Bands
const calculateBollingerBands = (
  prices: number[], 
  period: number, 
  stdDev: number
): { upper: number; lower: number; width: number } => {
  const sma = calculateSMA(prices, period);
  const volatility = calculateVolatility(prices, period);
  
  const upper = sma + stdDev * volatility;
  const lower = sma - stdDev * volatility;
  const width = ((upper - lower) / sma) * 100;
  
  return { upper, lower, width };
};

// Calculate OBV (On Balance Volume)
const calculateOBV = (closes: number[], volumes: number[]): number => {
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
  }
  return obv;
};

// Calculate ROC (Rate of Change)
const calculateROC = (prices: number[], period: number): number => {
  if (prices.length < period + 1) return 0;
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - period - 1];
  return ((current - previous) / previous) * 100;
};

// Calculate Stochastic Oscillator
const calculateStochastic = (
  highs: number[], 
  lows: number[], 
  closes: number[], 
  period: number
): number => {
  if (closes.length < period) return 50;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const highest = Math.max(...recentHighs);
  const lowest = Math.min(...recentLows);
  const current = closes[closes.length - 1];
  
  if (highest === lowest) return 50;
  return ((current - lowest) / (highest - lowest)) * 100;
};

// Calculate Williams %R
const calculateWilliamsR = (
  highs: number[], 
  lows: number[], 
  closes: number[], 
  period: number
): number => {
  const stochastic = calculateStochastic(highs, lows, closes, period);
  return stochastic - 100;
};

// Calculate ADX (Average Directional Index)
const calculateADX = (
  highs: number[], 
  lows: number[], 
  closes: number[], 
  period: number
): number => {
  // Simplified ADX calculation
  if (closes.length < period + 1) return 25;
  
  let dmPlus = 0;
  let dmMinus = 0;
  
  for (let i = 1; i < period; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    
    if (upMove > downMove && upMove > 0) dmPlus += upMove;
    if (downMove > upMove && downMove > 0) dmMinus += downMove;
  }
  
  const diPlus = (dmPlus / period) * 100;
  const diMinus = (dmMinus / period) * 100;
  const dx = Math.abs((diPlus - diMinus) / (diPlus + diMinus)) * 100;
  
  return dx;
};

// Calculate Trend Strength
const calculateTrendStrength = (
  closes: number[], 
  sma50: number, 
  sma200: number
): number => {
  const currentPrice = closes[closes.length - 1];
  
  // Strong uptrend: Price > SMA50 > SMA200
  if (currentPrice > sma50 && sma50 > sma200) return 100;
  
  // Moderate uptrend: Price > SMA50
  if (currentPrice > sma50) return 70;
  
  // Moderate downtrend: Price < SMA50
  if (currentPrice < sma50 && sma50 > sma200) return 30;
  
  // Strong downtrend: Price < SMA50 < SMA200
  if (currentPrice < sma50 && sma50 < sma200) return 0;
  
  return 50;
};

// Generate comprehensive prediction
export const generateFuturesPrediction = (
  contract: FuturesContract,
  historicalData: FuturesHistoricalData[]
): FuturesPrediction => {
  const features = calculateAdvancedIndicators(historicalData);
  const currentPrice = contract.lastPrice;
  
  // Calculate signal scores
  const technicalScore = calculateTechnicalScore(features, currentPrice);
  const momentumScore = calculateMomentumScore(features);
  const volumeScore = calculateVolumeScore(features, contract);
  const trendScore = features.trendStrength;
  
  // Composite score
  const compositeScore = (
    technicalScore * 0.35 +
    momentumScore * 0.25 +
    volumeScore * 0.20 +
    trendScore * 0.20
  );
  
  // Determine prediction
  let prediction: FuturesPrediction["prediction"];
  let confidence: number;
  let timeHorizon: FuturesPrediction["timeHorizon"];
  
  if (compositeScore >= 80) {
    prediction = "STRONG_BUY";
    confidence = Math.min(compositeScore, 95);
    timeHorizon = "INTRADAY";
  } else if (compositeScore >= 60) {
    prediction = "BUY";
    confidence = compositeScore;
    timeHorizon = "SHORT_TERM";
  } else if (compositeScore >= 40) {
    prediction = "HOLD";
    confidence = 100 - Math.abs(compositeScore - 50);
    timeHorizon = "MEDIUM_TERM";
  } else if (compositeScore >= 20) {
    prediction = "SELL";
    confidence = 100 - compositeScore;
    timeHorizon = "SHORT_TERM";
  } else {
    prediction = "STRONG_SELL";
    confidence = Math.min(100 - compositeScore, 95);
    timeHorizon = "INTRADAY";
  }
  
  // Calculate targets based on time horizon
  const atrMultiplier =
    timeHorizon === "INTRADAY" ? 1.5 :
    timeHorizon === "SHORT_TERM" ? 2.5 :
    timeHorizon === "MEDIUM_TERM" ? 3.5 : 4.5;
  const targetDistance = features.atr * atrMultiplier;
  const stopDistance = features.atr * 1;
  
  let targetPrice: number;
  let stopLoss: number;
  
  if (prediction.includes("BUY")) {
    targetPrice = currentPrice + targetDistance;
    stopLoss = currentPrice - stopDistance;
  } else {
    targetPrice = currentPrice - targetDistance;
    stopLoss = currentPrice + stopDistance;
  }
  
  const riskReward = Math.abs(targetPrice - currentPrice) / Math.abs(stopLoss - currentPrice);
  
  // Generate reasoning
  const reasoning = generateReasoning(features, contract, compositeScore);
  
  return {
    symbol: contract.symbol,
    prediction,
    confidence: Math.round(confidence),
    targetPrice: Math.round(targetPrice * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    entryPrice: currentPrice,
    timeHorizon,
    riskReward: Math.round(riskReward * 100) / 100,
    signals: {
      technical: Math.round(technicalScore),
      momentum: Math.round(momentumScore),
      volume: Math.round(volumeScore),
      trend: Math.round(trendScore),
    },
    reasoning,
  };
};

// Calculate technical analysis score
const calculateTechnicalScore = (features: PredictionFeatures, currentPrice: number): number => {
  let score = 50;
  
  // RSI signals
  if (features.rsi < 30) score += 20;
  else if (features.rsi < 40) score += 10;
  else if (features.rsi > 70) score -= 20;
  else if (features.rsi > 60) score -= 10;
  
  // MACD signals
  if (features.macdHistogram > 0 && features.macd > features.macdSignal) score += 15;
  else if (features.macdHistogram < 0 && features.macd < features.macdSignal) score -= 15;
  
  // Moving average signals
  if (currentPrice > features.sma20 && features.sma20 > features.sma50) score += 15;
  else if (currentPrice < features.sma20 && features.sma20 < features.sma50) score -= 15;
  
  // Bollinger Bands
  if (currentPrice <= features.bollingerLower) score += 10;
  else if (currentPrice >= features.bollingerUpper) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Calculate momentum score
const calculateMomentumScore = (features: PredictionFeatures): number => {
  let score = 50;
  
  // Stochastic
  if (features.stochastic < 20) score += 20;
  else if (features.stochastic > 80) score -= 20;
  
  // ROC
  if (features.roc > 5) score += 15;
  else if (features.roc < -5) score -= 15;
  
  // Williams %R
  if (features.williamsR < -80) score += 15;
  else if (features.williamsR > -20) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

// Calculate volume score
const calculateVolumeScore = (features: PredictionFeatures, contract: FuturesContract): number => {
  let score = 50;
  
  // Volume ratio
  if (features.volumeRatio > 1.5) score += 20;
  else if (features.volumeRatio < 0.7) score -= 10;
  
  // OBV trend
  if (features.obv > 0) score += 15;
  else if (features.obv < 0) score -= 15;
  
  // Open Interest (futures-specific)
  if (features.oiChange > 5 && contract.change > 0) score += 15;
  else if (features.oiChange > 5 && contract.change < 0) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

// Generate reasoning for the prediction
const generateReasoning = (
  features: PredictionFeatures,
  contract: FuturesContract,
  score: number
): string[] => {
  const reasoning: string[] = [];
  
  // RSI reasoning
  if (features.rsi < 30) {
    reasoning.push("RSI indicates oversold conditions, potential reversal upward");
  } else if (features.rsi > 70) {
    reasoning.push("RSI indicates overbought conditions, potential reversal downward");
  }
  
  // MACD reasoning
  if (features.macdHistogram > 0) {
    reasoning.push("MACD showing bullish momentum with positive histogram");
  } else if (features.macdHistogram < 0) {
    reasoning.push("MACD showing bearish momentum with negative histogram");
  }
  
  // Trend reasoning
  if (features.trendStrength > 70) {
    reasoning.push("Strong uptrend confirmed by moving averages");
  } else if (features.trendStrength < 30) {
    reasoning.push("Strong downtrend confirmed by moving averages");
  }
  
  // Volume reasoning
  if (features.volumeRatio > 1.5) {
    reasoning.push("Above-average volume supporting the move");
  }
  
  // Open Interest reasoning
  if (features.oiChange > 5) {
    reasoning.push("Increasing open interest indicates fresh positions being built");
  } else if (features.oiChange < -5) {
    reasoning.push("Decreasing open interest indicates position unwinding");
  }
  
  // ADX reasoning
  if (features.adx > 40) {
    reasoning.push("Strong directional movement (ADX > 40)");
  }
  
  // Volatility reasoning
  if (features.bollingerWidth > 5) {
    reasoning.push("High volatility environment, expect larger moves");
  }
  
  return reasoning;
};

// Batch prediction for multiple contracts
export const generateBatchPredictions = (
  contracts: FuturesContract[],
  historicalDataMap: Map<string, FuturesHistoricalData[]>
): FuturesPrediction[] => {
  const predictions: FuturesPrediction[] = [];
  
  for (const contract of contracts) {
    const historicalData = historicalDataMap.get(contract.symbol);
    if (historicalData && historicalData.length > 50) {
      const prediction = generateFuturesPrediction(contract, historicalData);
      predictions.push(prediction);
    }
  }
  
  // Sort by confidence
  return predictions.sort((a, b) => b.confidence - a.confidence);
};
