import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, TrendingUp, BarChart3, StopCircle, PlayCircle, Moon, Sun, LineChart as LineChartIcon } from "lucide-react";
import { toast } from "sonner";
import { SymbolSearch } from "./SymbolSearch";
import { parseCSV, CandleData, backtestStrategy, DEFAULT_PARAMS } from "@/utils/mlTraining";
import {
  createInitialPopulation,
  evaluatePopulation,
  evolvePopulation,
  Individual
} from "@/utils/geneticOptimizer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  samples: number;
  generation: number;
  bestProfit: number;
}

export const MLTrainingPanel = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [bestStrategy, setBestStrategy] = useState<Individual | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backtestData, setBacktestData] = useState<{ time: string; balance: number }[]>([]);
  const [candles, setCandles] = useState<CandleData[]>([]);

  const trainingRef = useRef<boolean>(false);
  const populationRef = useRef<Individual[]>([]);
  const generationRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      trainingRef.current = false;
    };
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const runTrainingStep = async (currentCandles: CandleData[]) => {
    if (!trainingRef.current) return;

    // 1. Initialize or Evolve
    if (generationRef.current === 0) {
      populationRef.current = createInitialPopulation();
    } else {
      populationRef.current = evolvePopulation(populationRef.current);
    }

    // 2. Evaluate
    populationRef.current = evaluatePopulation(populationRef.current, currentCandles);
    const best = populationRef.current[0];
    setBestStrategy(best);
    generationRef.current += 1;

    // 3. Update UI
    setMetrics({
      accuracy: best.accuracy,
      precision: best.profit,
      recall: 0,
      samples: currentCandles.length,
      generation: generationRef.current,
      bestProfit: best.profit
    });

    setTrainingProgress((prev) => (prev + 10) % 100);

    // 4. Continue Loop
    setTimeout(() => runTrainingStep(currentCandles), 100);
  };

  const startTraining = async (currentCandles: CandleData[]) => {
    if (currentCandles.length < 50) {
      toast.error("Insufficient data", {
        description: "Need at least 50 data points for training.",
      });
      return;
    }

    setCandles(currentCandles);
    setIsTraining(true);
    trainingRef.current = true;
    generationRef.current = 0;

    toast.success("Training Started", {
      description: "Optimizing strategy parameters... Click Stop to finish.",
    });

    runTrainingStep(currentCandles);
  };

  const stopTraining = () => {
    trainingRef.current = false;
    setIsTraining(false);
    toast.info("Training Stopped", {
      description: `Stopped at generation ${generationRef.current}. Best accuracy: ${metrics?.accuracy.toFixed(1)}%`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedCandles = parseCSV(text);
      setCandles(parsedCandles);
      startTraining(parsedCandles);
    } catch (error) {
      console.error("Training error:", error);
      toast.error("Training failed", {
        description: "Please check your CSV format.",
      });
    }
  };

  const handleAutoTrain = () => {
    if (!selectedSymbol) {
      toast.error("Select a symbol first");
      return;
    }

    const mockCandles: CandleData[] = Array.from({ length: 500 }, (_, i) => ({
      timestamp: Date.now() - (500 - i) * 60000,
      open: 100 + Math.random() * 10,
      high: 110 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 100 + Math.random() * 10 + (i * 0.1),
      volume: 1000 + Math.random() * 5000,
    }));

    setCandles(mockCandles);
    startTraining(mockCandles);
  };

  const runBacktest = () => {
    if (candles.length === 0) {
      toast.error("No data loaded", { description: "Please upload data or auto-train first." });
      return;
    }

    const params = bestStrategy ? bestStrategy.params : DEFAULT_PARAMS;
    const result = backtestStrategy(candles, params);

    if (result.equityCurve) {
      const formattedData = result.equityCurve.map(pt => ({
        time: new Date(pt.time).toLocaleDateString(),
        balance: Math.round(pt.balance)
      }));
      setBacktestData(formattedData);

      toast.success("Backtest Complete", {
        description: `Profit: ${result.profit.toFixed(2)}% | Trades: ${result.trades}`
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Intelligent ML Training</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <CardDescription>
          Continuous genetic optimization of trading parameters.
          The system evolves strategies to find the best patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto">Auto Train</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="backtest">Backtest & Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-file">Historical Data (CSV)</Label>
              <input
                id="data-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isTraining}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                CSV format: Date, Open, High, Low, Close, Volume
              </p>
            </div>
          </TabsContent>

          <TabsContent value="auto" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Symbol</Label>
                <SymbolSearch
                  onSelect={setSelectedSymbol}
                  placeholder="Type to search (e.g., NIFTY, RELIANCE)"
                />
                {selectedSymbol && (
                  <p className="text-sm text-primary">Selected: {selectedSymbol}</p>
                )}
              </div>

              {!isTraining ? (
                <Button onClick={handleAutoTrain} disabled={!selectedSymbol} className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Continuous Training
                </Button>
              ) : (
                <Button onClick={stopTraining} variant="destructive" className="w-full">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Training
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="backtest" className="space-y-4">
            <div className="flex flex-col gap-4">
              <Button onClick={runBacktest} className="w-full" disabled={candles.length === 0}>
                <LineChartIcon className="w-4 h-4 mr-2" />
                Run Backtest with Best Strategy
              </Button>

              {backtestData.length > 0 ? (
                <div className="h-[300px] w-full bg-card border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backtestData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#eee"} />
                      <XAxis dataKey="time" stroke={isDarkMode ? "#888" : "#666"} fontSize={12} tickMargin={10} />
                      <YAxis stroke={isDarkMode ? "#888" : "#666"} fontSize={12} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                          color: isDarkMode ? "#fff" : "#000"
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center border rounded-lg border-dashed text-muted-foreground">
                  No backtest data available. Train model first.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isTraining && (
          <div className="mt-4 animate-pulse">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Optimizing Generation {generationRef.current}...</span>
              <Brain className="w-4 h-4 animate-spin" />
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}

        {metrics && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <BarChart3 className="w-4 h-4 text-primary" />
              Live Training Stats
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Best Accuracy</div>
                <div className="font-bold text-lg text-green-500">{metrics.accuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Best Profit</div>
                <div className="font-bold text-lg text-blue-500">{metrics.bestProfit.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Generation</div>
                <div className="font-bold text-lg">{metrics.generation}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Samples</div>
                <div className="font-bold text-lg">{metrics.samples}</div>
              </div>
            </div>
            {bestStrategy && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-mono text-muted-foreground">
                  Best Params: RSI:{bestStrategy.params.rsiPeriod} |
                  MACD:{bestStrategy.params.macdFast}/{bestStrategy.params.macdSlow} |
                  SMA:{bestStrategy.params.smaFastPeriod}/{bestStrategy.params.smaSlowPeriod}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
