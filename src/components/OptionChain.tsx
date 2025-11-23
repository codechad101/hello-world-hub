import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockOptions = [
  { strike: 22400, ce_ltp: 180, ce_signal: "BUY", pe_ltp: 45, pe_signal: "HOLD" },
  { strike: 22450, ce_ltp: 135, ce_signal: "HOLD", pe_ltp: 68, pe_signal: "HOLD" },
  { strike: 22500, ce_ltp: 95, ce_signal: "SELL", pe_ltp: 98, pe_signal: "BUY" },
  { strike: 22550, ce_ltp: 62, ce_signal: "SELL", pe_ltp: 145, pe_signal: "BUY" },
  { strike: 22600, ce_ltp: 38, ce_signal: "HOLD", pe_ltp: 198, pe_signal: "SELL" },
];

export const OptionChain = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Option Chain with ML Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">CE Signal</TableHead>
                <TableHead className="text-right">CE LTP</TableHead>
                <TableHead className="text-center font-bold">Strike</TableHead>
                <TableHead className="text-left">PE LTP</TableHead>
                <TableHead className="text-center">PE Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOptions.map((option) => (
                <TableRow key={option.strike}>
                  <TableCell className="text-center">
                    <Badge
                      variant={option.ce_signal === "BUY" ? "default" : option.ce_signal === "SELL" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {option.ce_signal}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{option.ce_ltp}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{option.strike}</TableCell>
                  <TableCell className="text-left font-medium">₹{option.pe_ltp}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={option.pe_signal === "BUY" ? "default" : option.pe_signal === "SELL" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {option.pe_signal}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
