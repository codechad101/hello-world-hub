// Futures Backtesting Engine
// Comprehensive backtesting system for futures trading strategies

import { FuturesHistoricalData, FuturesContract } from "@/services/futuresAPI";
import { 
  generateFuturesPrediction, 
  FuturesPrediction 
} from "./futuresPredictions";

export interface BacktestConfig {
  initialCapital: number;
  positionSize: number; // Number of lots
  maxPositions: number;
  riskPerTrade: number; // Percentage of capital
  useStopLoss: boolean;
  useTrailingStop: boolean;
  trailingStopPercent: number;
  commission: number; // Per trade
  slippage: number; // Price slippage in points
}

export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  initialCapital: 100000,
  positionSize: 1,
  maxPositions: 3,
  riskPerTrade: 2,
  useStopLoss: true,
  useTrailingStop: true,
  trailingStopPercent: 1.5,
  commission: 20,
  slippage: 0.5,
};

export interface BacktestTrade {
  entryDate: number;
  exitDate: number;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  exitReason: "TARGET" | "STOP_LOSS" | "SIGNAL" | "END_OF_DATA";
  holdingPeriod: number; // in days
}

export interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  averageHoldingPeriod: number;
  expectancy: number;
  recoveryFactor: number;
  calmarRatio: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  metrics: BacktestMetrics;
  trades: BacktestTrade[];
  equityCurve: { date: number; equity: number; drawdown: number }[];
  monthlyReturns: { month: string; return: number }[];
  symbol: string;
  startDate: number;
  endDate: number;
}

export interface OpenPosition {
  entryDate: number;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  target: number;
  trailingStop: number;
}

// Run backtest on futures data
export const runFuturesBacktest = (
  contract: FuturesContract,
  historicalData: FuturesHistoricalData[],
  config: BacktestConfig = DEFAULT_BACKTEST_CONFIG
): BacktestResult => {
  const trades: BacktestTrade[] = [];
  const equityCurve: { date: number; equity: number; drawdown: number }[] = [];
  const openPositions: OpenPosition[] = [];
  
  let capital = config.initialCapital;
  let peakCapital = config.initialCapital;
  let currentDrawdown = 0;
  let maxDrawdown = 0;
  
  // Need at least 200 data points for indicators
  if (historicalData.length < 200) {
    throw new Error("Insufficient historical data for backtesting");
  }
  
  // Start from 200th candle to have enough data for indicators
  for (let i = 200; i < historicalData.length; i++) {
    const currentDate = historicalData[i].timestamp;
    const currentPrice = historicalData[i].close;
    
    // Update trailing stops and check exits for open positions
    for (let j = openPositions.length - 1; j >= 0; j--) {
      const position = openPositions[j];
      const currentPnL = position.type === "LONG" 
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;
      
      // Update trailing stop
      if (config.useTrailingStop) {
        if (position.type === "LONG" && currentPnL > 0) {
          const newTrailingStop = currentPrice * (1 - config.trailingStopPercent / 100);
          position.trailingStop = Math.max(position.trailingStop, newTrailingStop);
        } else if (position.type === "SHORT" && currentPnL > 0) {
          const newTrailingStop = currentPrice * (1 + config.trailingStopPercent / 100);
          position.trailingStop = Math.min(position.trailingStop, newTrailingStop);
        }
      }
      
      // Check exit conditions
      let shouldExit = false;
      let exitReason: BacktestTrade["exitReason"] = "SIGNAL";
      let exitPrice = currentPrice;
      
      // Check stop loss
      if (config.useStopLoss) {
        if (position.type === "LONG" && currentPrice <= position.stopLoss) {
          shouldExit = true;
          exitReason = "STOP_LOSS";
          exitPrice = position.stopLoss - config.slippage;
        } else if (position.type === "SHORT" && currentPrice >= position.stopLoss) {
          shouldExit = true;
          exitReason = "STOP_LOSS";
          exitPrice = position.stopLoss + config.slippage;
        }
      }
      
      // Check trailing stop
      if (config.useTrailingStop && !shouldExit) {
        if (position.type === "LONG" && currentPrice <= position.trailingStop) {
          shouldExit = true;
          exitReason = "STOP_LOSS";
          exitPrice = position.trailingStop - config.slippage;
        } else if (position.type === "SHORT" && currentPrice >= position.trailingStop) {
          shouldExit = true;
          exitReason = "STOP_LOSS";
          exitPrice = position.trailingStop + config.slippage;
        }
      }
      
      // Check target
      if (!shouldExit) {
        if (position.type === "LONG" && currentPrice >= position.target) {
          shouldExit = true;
          exitReason = "TARGET";
          exitPrice = position.target;
        } else if (position.type === "SHORT" && currentPrice <= position.target) {
          shouldExit = true;
          exitReason = "TARGET";
          exitPrice = position.target;
        }
      }
      
      // Exit position
      if (shouldExit) {
        const pnl = position.type === "LONG"
          ? (exitPrice - position.entryPrice) * position.quantity - config.commission * 2
          : (position.entryPrice - exitPrice) * position.quantity - config.commission * 2;
        
        const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
        const holdingPeriod = (currentDate - position.entryDate) / (1000 * 60 * 60 * 24);
        
        trades.push({
          entryDate: position.entryDate,
          exitDate: currentDate,
          symbol: position.symbol,
          type: position.type,
          entryPrice: position.entryPrice,
          exitPrice: exitPrice,
          quantity: position.quantity,
          pnl,
          pnlPercent,
          commission: config.commission * 2,
          exitReason,
          holdingPeriod,
        });
        
        capital += pnl;
        openPositions.splice(j, 1);
      }
    }
    
    // Generate signal for new entries
    if (openPositions.length < config.maxPositions) {
      const dataForPrediction = historicalData.slice(0, i + 1);
      const prediction = generateFuturesPrediction(contract, dataForPrediction);
      
      // Entry conditions
      const shouldEnterLong = 
        prediction.prediction === "STRONG_BUY" || 
        (prediction.prediction === "BUY" && prediction.confidence > 70);
      
      const shouldEnterShort = 
        prediction.prediction === "STRONG_SELL" || 
        (prediction.prediction === "SELL" && prediction.confidence > 70);
      
      if (shouldEnterLong || shouldEnterShort) {
        const riskAmount = capital * (config.riskPerTrade / 100);
        const stopDistance = Math.abs(currentPrice - prediction.stopLoss);
        const lotSize = contract.lotSize;
        
        // Calculate position size based on risk
        let quantity = Math.floor(riskAmount / (stopDistance * lotSize)) * lotSize;
        quantity = Math.max(quantity, lotSize); // At least 1 lot
        quantity = Math.min(quantity, config.positionSize * lotSize); // Max position size
        
        const requiredMargin = contract.marginRequired * (quantity / lotSize);
        
        // Check if we have enough capital
        if (capital > requiredMargin * 1.2) { // 20% buffer
          const entryPrice = shouldEnterLong 
            ? currentPrice + config.slippage 
            : currentPrice - config.slippage;
          
          openPositions.push({
            entryDate: currentDate,
            symbol: contract.symbol,
            type: shouldEnterLong ? "LONG" : "SHORT",
            entryPrice,
            quantity,
            stopLoss: prediction.stopLoss,
            target: prediction.targetPrice,
            trailingStop: shouldEnterLong 
              ? entryPrice * (1 - config.trailingStopPercent / 100)
              : entryPrice * (1 + config.trailingStopPercent / 100),
          });
          
          capital -= config.commission; // Entry commission
        }
      }
    }
    
    // Update equity curve
    let totalUnrealizedPnL = 0;
    for (const position of openPositions) {
      const unrealized = position.type === "LONG"
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;
      totalUnrealizedPnL += unrealized;
    }
    
    const equity = capital + totalUnrealizedPnL;
    
    if (equity > peakCapital) {
      peakCapital = equity;
    }
    
    currentDrawdown = ((peakCapital - equity) / peakCapital) * 100;
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    
    // Record equity every day (or less frequently to reduce data)
    if (i % 10 === 0 || i === historicalData.length - 1) {
      equityCurve.push({
        date: currentDate,
        equity,
        drawdown: currentDrawdown,
      });
    }
  }
  
  // Close remaining positions at end of data
  const finalPrice = historicalData[historicalData.length - 1].close;
  const finalDate = historicalData[historicalData.length - 1].timestamp;
  
  for (const position of openPositions) {
    const pnl = position.type === "LONG"
      ? (finalPrice - position.entryPrice) * position.quantity - config.commission * 2
      : (position.entryPrice - finalPrice) * position.quantity - config.commission * 2;
    
    const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
    const holdingPeriod = (finalDate - position.entryDate) / (1000 * 60 * 60 * 24);
    
    trades.push({
      entryDate: position.entryDate,
      exitDate: finalDate,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: finalPrice,
      quantity: position.quantity,
      pnl,
      pnlPercent,
      commission: config.commission * 2,
      exitReason: "END_OF_DATA",
      holdingPeriod,
    });
    
    capital += pnl;
  }
  
  // Calculate metrics
  const metrics = calculateBacktestMetrics(trades, capital, config.initialCapital, maxDrawdown);
  
  // Calculate monthly returns
  const monthlyReturns = calculateMonthlyReturns(equityCurve);
  
  return {
    config,
    metrics,
    trades,
    equityCurve,
    monthlyReturns,
    symbol: contract.symbol,
    startDate: historicalData[200].timestamp,
    endDate: historicalData[historicalData.length - 1].timestamp,
  };
};

// Calculate comprehensive backtest metrics
const calculateBacktestMetrics = (
  trades: BacktestTrade[],
  finalCapital: number,
  initialCapital: number,
  maxDrawdown: number
): BacktestMetrics => {
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalPnL = finalCapital - initialCapital;
  const totalPnLPercent = (totalPnL / initialCapital) * 100;
  
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  
  const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  
  const averageWin = wins.length > 0 ? totalWins / wins.length : 0;
  const averageLoss = losses.length > 0 ? totalLosses / losses.length : 0;
  
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
  
  const averageHoldingPeriod = 
    totalTrades > 0 
      ? trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / totalTrades 
      : 0;
  
  const expectancy = 
    totalTrades > 0
      ? (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss
      : 0;
  
  const recoveryFactor = maxDrawdown > 0 ? totalPnLPercent / maxDrawdown : 0;
  
  // Calculate Sharpe Ratio (simplified)
  const returns = trades.map((t) => t.pnlPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
  
  const calmarRatio = maxDrawdown > 0 ? totalPnLPercent / maxDrawdown : 0;
  
  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    totalPnL,
    totalPnLPercent,
    averageWin,
    averageLoss,
    profitFactor,
    maxDrawdown,
    maxDrawdownPercent: maxDrawdown,
    sharpeRatio,
    averageHoldingPeriod,
    expectancy,
    recoveryFactor,
    calmarRatio,
  };
};

// Calculate monthly returns
const calculateMonthlyReturns = (
  equityCurve: { date: number; equity: number; drawdown: number }[]
): { month: string; return: number }[] => {
  const monthlyReturns: { month: string; return: number }[] = [];
  const monthMap = new Map<string, { start: number; end: number }>();
  
  for (const point of equityCurve) {
    const date = new Date(point.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { start: point.equity, end: point.equity });
    } else {
      const monthData = monthMap.get(monthKey)!;
      monthData.end = point.equity;
    }
  }
  
  for (const [month, data] of monthMap) {
    const monthReturn = ((data.end - data.start) / data.start) * 100;
    monthlyReturns.push({ month, return: monthReturn });
  }
  
  return monthlyReturns;
};

// Compare multiple strategies
export const compareStrategies = (
  results: BacktestResult[]
): {
  comparison: {
    symbol: string;
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    profitFactor: number;
  }[];
  bestByReturn: string;
  bestBySharpe: string;
  bestByWinRate: string;
} => {
  const comparison = results.map((result) => ({
    symbol: result.symbol,
    totalReturn: result.metrics.totalPnLPercent,
    winRate: result.metrics.winRate,
    sharpeRatio: result.metrics.sharpeRatio,
    maxDrawdown: result.metrics.maxDrawdownPercent,
    profitFactor: result.metrics.profitFactor,
  }));
  
  const bestByReturn = comparison.reduce((best, current) => 
    current.totalReturn > best.totalReturn ? current : best
  ).symbol;
  
  const bestBySharpe = comparison.reduce((best, current) => 
    current.sharpeRatio > best.sharpeRatio ? current : best
  ).symbol;
  
  const bestByWinRate = comparison.reduce((best, current) => 
    current.winRate > best.winRate ? current : best
  ).symbol;
  
  return {
    comparison,
    bestByReturn,
    bestBySharpe,
    bestByWinRate,
  };
};
