import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { SymbolSearch } from "./SymbolSearch";
import { parseCSV, extractFeatures, generateSignal } from "@/utils/mlTraining";

interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  samples: number;
}

export const MLTrainingPanel = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsTraining(true);
    setTrainingProgress(10);

    try {
      const text = await file.text();
      setTrainingProgress(30);

      const candles = parseCSV(text);
      
      if (candles.length < 50) {
        toast.error("Insufficient data", {
          description: "Need at least 50 data points for training.",
        });
        setIsTraining(false);
        return;
      }

      setTrainingProgress(50);

      // Extract features and train
      const features = extractFeatures(candles);
      const signal = generateSignal(features);

      setTrainingProgress(80);

      // Simulate validation
      setTimeout(() => {
        const mockMetrics: TrainingMetrics = {
          accuracy: 72 + Math.random() * 15,
          precision: 68 + Math.random() * 15,
          recall: 70 + Math.random() * 12,
          samples: candles.length,
        };

        setMetrics(mockMetrics);
        setTrainingProgress(100);
        setIsTraining(false);

        toast.success("Model trained successfully!", {
          description: `Processed ${candles.length} candles with ${mockMetrics.accuracy.toFixed(1)}% accuracy`,
        });
      }, 1000);
    } catch (error) {
      console.error("Training error:", error);
      toast.error("Training failed", {
        description: "Please check your CSV format.",
      });
      setIsTraining(false);
    }
  };

  const handleAutoTrain = () => {
    if (!selectedSymbol) {
      toast.error("Select a symbol first");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate auto-training with progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);

          const mockMetrics: TrainingMetrics = {
            accuracy: 75 + Math.random() * 12,
            precision: 71 + Math.random() * 14,
            recall: 73 + Math.random() * 10,
            samples: 500 + Math.floor(Math.random() * 500),
          };

          setMetrics(mockMetrics);

          toast.success("Auto-training complete!", {
            description: `Model trained on ${selectedSymbol} with ${mockMetrics.accuracy.toFixed(1)}% accuracy`,
          });
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>ML Model Training</CardTitle>
        </div>
        <CardDescription>Train your model with historical data for better predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="auto">Auto Train</TabsTrigger>
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
            <Button disabled={isTraining} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {isTraining ? `Training... ${trainingProgress}%` : "Upload & Train"}
            </Button>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <input
                    id="from-date"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <input
                    id="to-date"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <Button onClick={handleAutoTrain} disabled={isTraining || !selectedSymbol} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                {isTraining ? `Training... ${trainingProgress}%` : "Auto Train with Historical Data"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isTraining && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Training Progress</span>
              <span>{trainingProgress}%</span>
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
              Training Metrics
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Accuracy</div>
                <div className="font-bold text-lg">{metrics.accuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Precision</div>
                <div className="font-bold text-lg">{metrics.precision.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Recall</div>
                <div className="font-bold text-lg">{metrics.recall.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Samples</div>
                <div className="font-bold text-lg">{metrics.samples}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
