import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, TrendingUp, BarChart3, StopCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { SymbolSearch } from "./SymbolSearch";
import { parseCSV, CandleData } from "@/utils/mlTraining";
import {
  createInitialPopulation,
  evaluatePopulation,
  evolvePopulation,
  Individual
} from "@/utils/geneticOptimizer";

interface TrainingMetrics {
  accuracy: number;
  precision: number; // We'll map profit to this for now or add a new field
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

  const trainingRef = useRef<boolean>(false);
  const populationRef = useRef<Individual[]>([]);
  const generationRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      trainingRef.current = false;
    };
  }, []);

  const runTrainingStep = async (candles: CandleData[]) => {
    if (!trainingRef.current) return;

    // 1. Initialize or Evolve
    if (generationRef.current === 0) {
      populationRef.current = createInitialPopulation();
    } else {
      populationRef.current = evolvePopulation(populationRef.current);
    }

    // 2. Evaluate
    populationRef.current = evaluatePopulation(populationRef.current, candles);
    const best = populationRef.current[0];
    setBestStrategy(best);
    generationRef.current += 1;

    // 3. Update UI
    setMetrics({
      accuracy: best.accuracy,
      precision: best.profit, // Using precision field for profit display temporarily
      recall: 0,
      samples: candles.length,
      generation: generationRef.current,
      bestProfit: best.profit
    });

    setTrainingProgress((prev) => (prev + 10) % 100); // Visual indicator only

    // 4. Continue Loop
    // Use setTimeout to allow UI updates and prevent freezing
    setTimeout(() => runTrainingStep(candles), 100);
  };

  const startTraining = async (candles: CandleData[]) => {
    if (candles.length < 50) {
      toast.error("Insufficient data", {
        description: "Need at least 50 data points for training.",
      });
      return;
    }

    setIsTraining(true);
    trainingRef.current = true;
    generationRef.current = 0;

    toast.success("Training Started", {
      description: "Optimizing strategy parameters... Click Stop to finish.",
    });

    runTrainingStep(candles);
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
      const candles = parseCSV(text);
      startTraining(candles);
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

    // Mock data generation for demo purposes if no real API is connected yet
    // In a real app, this would fetch from an API
    const mockCandles: CandleData[] = Array.from({ length: 500 }, (_, i) => ({
      timestamp: Date.now() - (500 - i) * 60000,
      open: 100 + Math.random() * 10,
      high: 110 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 100 + Math.random() * 10 + (i * 0.1), // Slight uptrend
      volume: 1000 + Math.random() * 5000,
    }));

    startTraining(mockCandles);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>Intelligent ML Training</CardTitle>
        </div>
        <CardDescription>
          Continuous genetic optimization of trading parameters.
          The system evolves strategies to find the best patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Auto Train</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
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
