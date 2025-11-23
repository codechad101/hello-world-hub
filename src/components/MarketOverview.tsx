import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { time: "9:15", nifty: 22450, banknifty: 48200 },
  { time: "10:00", nifty: 22480, banknifty: 48350 },
  { time: "11:00", nifty: 22420, banknifty: 48180 },
  { time: "12:00", nifty: 22500, banknifty: 48420 },
  { time: "13:00", nifty: 22550, banknifty: 48580 },
  { time: "14:00", nifty: 22520, banknifty: 48450 },
  { time: "15:00", nifty: 22580, banknifty: 48620 },
];

export const MarketOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market Overview</span>
          <span className="text-sm font-normal text-bullish">+1.2% Today</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line type="monotone" dataKey="nifty" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="banknifty" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
