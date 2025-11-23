import { Activity, Brain, TrendingUp } from "lucide-react";

export const TradingHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Options ML Trader</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Trading Decisions</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-bullish" />
              <span className="text-sm font-medium text-foreground">Live Market</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">ML Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
