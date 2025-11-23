import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, TrendingUp } from "lucide-react";

export const RiskAnalysis = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-bullish" />
            Portfolio Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-bullish">Low</div>
          <p className="text-xs text-muted-foreground mt-1">Well diversified positions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">67%</div>
          <p className="text-xs text-muted-foreground mt-1">Based on ML predictions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-bearish" />
            Max Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-bearish">₹12,450</div>
          <p className="text-xs text-muted-foreground mt-1">Across all positions</p>
        </CardContent>
      </Card>
    </div>
  );
};
