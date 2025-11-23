import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const MLTrainingPanel = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const handleTrain = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast.success("Model trained successfully!", {
            description: "Your ML model is now ready to make predictions.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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
              <Input id="data-file" type="file" accept=".csv" />
              <p className="text-xs text-muted-foreground">
                Upload CSV with columns: Date, Open, High, Low, Close, Volume
              </p>
            </div>
            <Button onClick={handleTrain} disabled={isTraining} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {isTraining ? `Training... ${trainingProgress}%` : "Train Model"}
            </Button>
          </TabsContent>
          
          <TabsContent value="auto" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" placeholder="NIFTY, BANKNIFTY" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <Input id="from-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <Input id="to-date" type="date" />
                </div>
              </div>
              <Button onClick={handleTrain} disabled={isTraining} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                {isTraining ? `Training... ${trainingProgress}%` : "Auto Train with Historical Data"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isTraining && (
          <div className="mt-4">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
