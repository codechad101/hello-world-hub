import { useEffect, useState } from "react";
import { TradingHeader } from "@/components/TradingHeader";
import { PredictionCard } from "@/components/PredictionCard";
import { MarketOverview } from "@/components/MarketOverview";
import { MLTrainingPanel } from "@/components/MLTrainingPanel";
import { OptionChain } from "@/components/OptionChain";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { toast } from "sonner";

interface Prediction {
  symbol: string;
  prediction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
}

const Index = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    // Simulate ML predictions (in production, this would call your ML model)
    const mockPredictions: Prediction[] = [
      {
        symbol: "NIFTY 22500 CE",
        prediction: "BUY",
        confidence: 87,
        currentPrice: 95.50,
        targetPrice: 125.00,
        stopLoss: 85.00,
      },
      {
        symbol: "BANKNIFTY 48500 PE",
        prediction: "BUY",
        confidence: 82,
        currentPrice: 145.25,
        targetPrice: 180.00,
        stopLoss: 130.00,
      },
      {
        symbol: "NIFTY 22600 CE",
        prediction: "SELL",
        confidence: 75,
        currentPrice: 38.75,
        targetPrice: 25.00,
        stopLoss: 45.00,
      },
      {
        symbol: "BANKNIFTY 48300 CE",
        prediction: "HOLD",
        confidence: 65,
        currentPrice: 210.50,
        targetPrice: 215.00,
        stopLoss: 195.00,
      },
    ];

    setPredictions(mockPredictions);
    
    toast.info("ML Model Active", {
      description: "Analyzing market data for trading signals...",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TradingHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <RiskAnalysis />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview />
            
            <div>
              <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((pred, index) => (
                  <PredictionCard key={index} {...pred} />
                ))}
              </div>
            </div>

            <OptionChain />
          </div>

          <div className="space-y-6">
            <MLTrainingPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
