import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Search,
  PlayCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { 
  futuresAPI, 
  FuturesContract,
  FuturesPosition 
} from "@/services/futuresAPI";
import { 
  generateFuturesPrediction,
  FuturesPrediction 
} from "@/utils/futuresPredictions";
import { 
  runFuturesBacktest,
  BacktestResult,
  DEFAULT_BACKTEST_CONFIG 
} from "@/utils/futuresBacktesting";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const FuturesTrading = () => {
  const [contracts, setContracts] = useState<FuturesContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<FuturesContract | null>(null);
  const [prediction, setPrediction] = useState<FuturesPrediction | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load contracts on mount
  useEffect(() => {
    loadContracts();
    loadPositions();
    
    // Refresh market data every 5 seconds
    const interval = setInterval(() => {
      loadContracts();
      loadPositions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadContracts = async () => {
    try {
      const data = await futuresAPI.getContracts();
      setContracts(data);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await futuresAPI.getPositions();
      setPositions(data);
    } catch (error) {
      console.error("Failed to load positions:", error);
    }
  };

  const handleContractSelect = async (contract: FuturesContract) => {
    setSelectedContract(contract);
    setIsLoading(true);
    
    try {
      // Get historical data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
      
      const historicalData = await futuresAPI.getHistoricalData(
        contract.symbol,
        startDate,
        endDate,
        "1d"
      );
      
      // Generate prediction
      const pred = generateFuturesPrediction(contract, historicalData);
      setPrediction(pred);
      
      toast.success("Analysis Complete", {
        description: `${pred.prediction} with ${pred.confidence}% confidence`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: "Could not analyze the selected contract",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBacktest = async () => {
    if (!selectedContract) {
      toast.error("Select a contract first");
      return;
    }
    
    setIsBacktesting(true);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
      
      const historicalData = await futuresAPI.getHistoricalData(
        selectedContract.symbol,
        startDate,
        endDate,
        "1d"
      );
      
      const result = runFuturesBacktest(
        selectedContract,
        historicalData,
        DEFAULT_BACKTEST_CONFIG
      );
      
      setBacktestResult(result);
      
      toast.success("Backtest Complete", {
        description: `Total Return: ${result.metrics.totalPnLPercent.toFixed(2)}% | Win Rate: ${result.metrics.winRate.toFixed(1)}%`,
      });
    } catch (error) {
      console.error("Backtest error:", error);
      toast.error("Backtest failed", {
        description: String(error),
      });
    } finally {
      setIsBacktesting(false);
    }
  };

  const handlePlaceOrder = async (type: "BUY" | "SELL") => {
    if (!selectedContract) return;
    
    try {
      await futuresAPI.placeOrder({
        symbol: selectedContract.symbol,
        type,
        quantity: selectedContract.lotSize,
        price: selectedContract.lastPrice,
        orderType: "MARKET",
      });
      
      toast.success("Order Placed", {
        description: `${type} order for ${selectedContract.symbol}`,
      });
      
      loadPositions();
    } catch (error) {
      toast.error("Order failed", {
        description: "Could not place order",
      });
    }
  };

  const filteredContracts = contracts.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPredictionColor = (pred: FuturesPrediction["prediction"]) => {
    switch (pred) {
      case "STRONG_BUY": return "bg-green-500";
      case "BUY": return "bg-green-400";
      case "HOLD": return "bg-yellow-500";
      case "SELL": return "bg-red-400";
      case "STRONG_SELL": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Futures Trading & Analysis</h1>
          <p className="text-muted-foreground">
            Advanced backtesting and predictive analytics for futures markets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Contracts & Positions */}
          <div className="space-y-6">
            {/* Contract Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Futures Contracts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract.symbol}
                      className={`p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors ${
                        selectedContract?.symbol === contract.symbol
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => handleContractSelect(contract)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{contract.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {contract.name}
                          </div>
                        </div>
                        <Badge
                          variant={contract.change >= 0 ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {contract.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {contract.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">LTP:</span>
                        <span className="font-semibold">
                          ₹{contract.lastPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Vol: {(contract.volume / 1000).toFixed(0)}K</span>
                        <span>OI: {(contract.openInterest / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No open positions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {positions.map((position, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{position.symbol}</div>
                          <Badge variant={position.pnl >= 0 ? "default" : "destructive"}>
                            {position.pnl >= 0 ? "+" : ""}
                            {position.pnlPercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qty:</span>{" "}
                            {position.quantity}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Entry:</span>{" "}
                            ₹{position.entryPrice.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTP:</span>{" "}
                            ₹{position.currentPrice.toFixed(2)}
                          </div>
                          <div className={position.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                            <span className="text-muted-foreground">P&L:</span>{" "}
                            ₹{position.pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Panel - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {selectedContract ? (
              <>
                {/* Contract Details */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedContract.name}</CardTitle>
                        <CardDescription>{selectedContract.symbol}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          ₹{selectedContract.lastPrice.toFixed(2)}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            selectedContract.change >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {selectedContract.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {selectedContract.change.toFixed(2)} (
                          {selectedContract.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Open</div>
                        <div className="font-semibold">₹{selectedContract.open.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">High</div>
                        <div className="font-semibold text-green-500">
                          ₹{selectedContract.high.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Low</div>
                        <div className="font-semibold text-red-500">
                          ₹{selectedContract.low.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Volume</div>
                        <div className="font-semibold">
                          {(selectedContract.volume / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handlePlaceOrder("BUY")} 
                        className="flex-1"
                        variant="default"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Buy
                      </Button>
                      <Button 
                        onClick={() => handlePlaceOrder("SELL")} 
                        className="flex-1"
                        variant="destructive"
                      >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        Sell
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="prediction" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prediction">AI Prediction</TabsTrigger>
                    <TabsTrigger value="backtest">Backtest Analysis</TabsTrigger>
                  </TabsList>

                  {/* Prediction Tab */}
                  <TabsContent value="prediction" className="space-y-4">
                    {isLoading ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </CardContent>
                      </Card>
                    ) : prediction ? (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              AI Prediction
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge
                                  className={`${getPredictionColor(prediction.prediction)} text-white text-lg px-4 py-2`}
                                >
                                  {prediction.prediction.replace("_", " ")}
                                </Badge>
                                <div className="text-sm text-muted-foreground mt-2">
                                  Confidence: {prediction.confidence}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Time Horizon</div>
                                <div className="font-semibold">{prediction.timeHorizon.replace("_", " ")}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                                <div className="font-bold">₹{prediction.entryPrice.toFixed(2)}</div>
                              </div>
                              <div className="p-3 bg-green-500/10 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Target</div>
                                <div className="font-bold text-green-500">
                                  ₹{prediction.targetPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="p-3 bg-red-500/10 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                                <div className="font-bold text-red-500">
                                  ₹{prediction.stopLoss.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm font-semibold mb-2">Signal Breakdown</div>
                              <div className="grid grid-cols-4 gap-3 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Technical</div>
                                  <div className="font-semibold">{prediction.signals.technical}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Momentum</div>
                                  <div className="font-semibold">{prediction.signals.momentum}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Volume</div>
                                  <div className="font-semibold">{prediction.signals.volume}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Trend</div>
                                  <div className="font-semibold">{prediction.signals.trend}%</div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm font-semibold mb-2">Analysis Reasoning</div>
                              <ul className="space-y-1 text-sm">
                                {prediction.reasoning.map((reason, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="font-semibold">Risk/Reward Ratio</span>
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                1:{prediction.riskReward.toFixed(2)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                          Select a contract to view predictions
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Backtest Tab */}
                  <TabsContent value="backtest" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Backtesting Results
                          </CardTitle>
                          <Button
                            onClick={handleBacktest}
                            disabled={isBacktesting}
                          >
                            {isBacktesting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Run Backtest
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {backtestResult ? (
                          <div className="space-y-6">
                            {/* Performance Metrics */}
                            <div className="grid grid-cols-4 gap-4">
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Total Return</div>
                                <div
                                  className={`text-xl font-bold ${
                                    backtestResult.metrics.totalPnLPercent >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {backtestResult.metrics.totalPnLPercent.toFixed(2)}%
                                </div>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                                <div className="text-xl font-bold">
                                  {backtestResult.metrics.winRate.toFixed(1)}%
                                </div>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Profit Factor</div>
                                <div className="text-xl font-bold">
                                  {backtestResult.metrics.profitFactor.toFixed(2)}
                                </div>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
                                <div className="text-xl font-bold">
                                  {backtestResult.metrics.sharpeRatio.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Equity Curve */}
                            <div>
                              <div className="text-sm font-semibold mb-3">Equity Curve</div>
                              <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={backtestResult.equityCurve}>
                                    <defs>
                                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                      dataKey="date"
                                      tickFormatter={(timestamp) =>
                                        new Date(timestamp).toLocaleDateString()
                                      }
                                      stroke="#888"
                                    />
                                    <YAxis stroke="#888" />
                                    <Tooltip
                                      labelFormatter={(timestamp) =>
                                        new Date(timestamp).toLocaleDateString()
                                      }
                                      formatter={(value: number) => [`₹${value.toFixed(2)}`, "Equity"]}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="equity"
                                      stroke="#22c55e"
                                      strokeWidth={2}
                                      fill="url(#equityGradient)"
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Additional Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
                                <div className="font-semibold">{backtestResult.metrics.totalTrades}</div>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                                <div className="font-semibold text-red-500">
                                  {backtestResult.metrics.maxDrawdownPercent.toFixed(2)}%
                                </div>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Avg Hold Period</div>
                                <div className="font-semibold">
                                  {backtestResult.metrics.averageHoldingPeriod.toFixed(1)} days
                                </div>
                              </div>
                            </div>

                            {/* Trade Summary */}
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="text-sm font-semibold mb-3">Trade Summary</div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Winning Trades:</span>{" "}
                                  <span className="font-semibold text-green-500">
                                    {backtestResult.metrics.winningTrades}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Losing Trades:</span>{" "}
                                  <span className="font-semibold text-red-500">
                                    {backtestResult.metrics.losingTrades}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Average Win:</span>{" "}
                                  <span className="font-semibold">
                                    ₹{backtestResult.metrics.averageWin.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Average Loss:</span>{" "}
                                  <span className="font-semibold">
                                    ₹{backtestResult.metrics.averageLoss.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            Click "Run Backtest" to analyze historical performance
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <DollarSign className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Futures Contract</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose a contract from the list to view predictions, run backtests, and place trades
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturesTrading;
