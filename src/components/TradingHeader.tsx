import { Activity, Brain, TrendingUp, Landmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const TradingHeader = () => {
  const location = useLocation();
  
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ML Trading Platform</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Trading Decisions</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Options Trading</span>
            </Link>
            <Link
              to="/futures"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/futures"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span className="text-sm font-medium">Futures Trading</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
              <Brain className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">ML Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
