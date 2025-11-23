import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
import { cn } from "@/lib/utils";

interface SymbolSearchProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
  className?: string;
}

export const SymbolSearch = ({ onSelect, placeholder = "Search symbols (e.g., NIFTY, RELIANCE)", className }: SymbolSearchProps) => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, isLoading } = useSymbolSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery(symbol);
    setShowResults(false);
    onSelect(symbol);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {showResults && query && (
        <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-auto shadow-lg">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.symbol}-${result.exchange}`}
                  onClick={() => handleSelect(result.symbol)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {result.symbol}
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {result.exchange}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{result.name}</div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No symbols found. Try searching for NIFTY, BANKNIFTY, or company names.
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
