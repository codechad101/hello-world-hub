import { useState, useEffect } from "react";

interface SymbolResult {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  type: "EQUITY" | "INDEX" | "OPTION";
}

// Mock symbol database - in production, this would come from an API
const INDIAN_SYMBOLS: SymbolResult[] = [
  { symbol: "NIFTY", name: "Nifty 50", exchange: "NSE", type: "INDEX" },
  { symbol: "BANKNIFTY", name: "Bank Nifty", exchange: "NSE", type: "INDEX" },
  { symbol: "FINNIFTY", name: "Fin Nifty", exchange: "NSE", type: "INDEX" },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "TCS", name: "Tata Consultancy Services", exchange: "NSE", type: "EQUITY" },
  { symbol: "INFY", name: "Infosys Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "SBIN", name: "State Bank of India", exchange: "NSE", type: "EQUITY" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "ITC", name: "ITC Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", exchange: "NSE", type: "EQUITY" },
  { symbol: "LT", name: "Larsen & Toubro Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "WIPRO", name: "Wipro Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries", exchange: "NSE", type: "EQUITY" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", exchange: "NSE", type: "EQUITY" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", exchange: "NSE", type: "EQUITY" },
];

export const useSymbolSearch = (query: string) => {
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timeout = setTimeout(() => {
      const searchQuery = query.toUpperCase();
      const filtered = INDIAN_SYMBOLS.filter(
        (symbol) =>
          symbol.symbol.includes(searchQuery) ||
          symbol.name.toUpperCase().includes(searchQuery)
      ).slice(0, 8); // Limit to 8 results
      
      setResults(filtered);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  return { results, isLoading };
};
