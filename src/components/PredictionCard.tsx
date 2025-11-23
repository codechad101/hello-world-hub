import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  symbol: string;
  prediction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
}

export const PredictionCard = ({
  symbol,
  prediction,
  confidence,
  currentPrice,
  targetPrice,
  stopLoss,
}: PredictionCardProps) => {
  const isBullish = prediction === "BUY";
  const isBearish = prediction === "SELL";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{symbol}</CardTitle>
          <Badge
            className={cn(
              "text-xs font-semibold",
              isBullish && "bg-bullish text-bullish-foreground",
              isBearish && "bg-bearish text-bearish-foreground",
              prediction === "HOLD" && "bg-muted text-muted-foreground"
            )}
          >
            {prediction}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</p>
          </div>
          {isBullish && <TrendingUp className="w-8 h-8 text-bullish" />}
          {isBearish && <TrendingDown className="w-8 h-8 text-bearish" />}
          {prediction === "HOLD" && <AlertCircle className="w-8 h-8 text-muted-foreground" />}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ML Confidence:</span>
            <span className="font-semibold">{confidence}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                isBullish && "bg-bullish",
                isBearish && "bg-bearish",
                prediction === "HOLD" && "bg-muted-foreground"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Target</p>
            <p className="text-sm font-semibold text-bullish">₹{targetPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
            <p className="text-sm font-semibold text-bearish">₹{stopLoss.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
