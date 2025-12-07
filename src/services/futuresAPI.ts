// Futures API Service Module
// Handles all futures data operations, market data, and contract management

export interface FuturesContract {
  symbol: string;
  name: string;
  underlying: string;
  expiry: Date;
  lotSize: number;
  tickSize: number;
  contractSize: number;
  marginRequired: number;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface FuturesMarketData {
  timestamp: number;
  contracts: FuturesContract[];
  indices: {
    niftyFutures: number;
    bankNiftyFutures: number;
    finniftyFutures: number;
  };
  marketStatus: "open" | "closed" | "pre-open" | "post-close";
}

export interface FuturesOrder {
  orderId: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: "MARKET" | "LIMIT" | "STOP_LOSS";
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  timestamp: number;
  fillPrice?: number;
}

export interface FuturesPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  timestamp: number;
}

export interface FuturesHistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}

// Simulated Futures API
class FuturesAPIService {
  private baseUrl = "https://api.futures-trading.example.com"; // Mock API
  private contracts: FuturesContract[] = [];
  private positions: FuturesPosition[] = [];
  private orders: FuturesOrder[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with popular Indian futures contracts
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 30);

    this.contracts = [
      {
        symbol: "NIFTY-FUT",
        name: "NIFTY 50 Futures",
        underlying: "NIFTY",
        expiry: expiryDate,
        lotSize: 50,
        tickSize: 0.05,
        contractSize: 1125000,
        marginRequired: 112500,
        lastPrice: 22450.75,
        change: 125.50,
        changePercent: 0.56,
        volume: 2547890,
        openInterest: 4567823,
        bid: 22449.50,
        ask: 22451.00,
        high: 22498.25,
        low: 22401.75,
        open: 22425.00,
        previousClose: 22325.25,
      },
      {
        symbol: "BANKNIFTY-FUT",
        name: "BANK NIFTY Futures",
        underlying: "BANKNIFTY",
        expiry: expiryDate,
        lotSize: 25,
        tickSize: 0.05,
        contractSize: 1212500,
        marginRequired: 121250,
        lastPrice: 48500.50,
        change: -85.25,
        changePercent: -0.18,
        volume: 1876543,
        openInterest: 3234567,
        bid: 48498.75,
        ask: 48502.25,
        high: 48612.00,
        low: 48456.50,
        open: 48585.75,
        previousClose: 48585.75,
      },
      {
        symbol: "FINNIFTY-FUT",
        name: "FIN NIFTY Futures",
        underlying: "FINNIFTY",
        expiry: expiryDate,
        lotSize: 40,
        tickSize: 0.05,
        contractSize: 880000,
        marginRequired: 88000,
        lastPrice: 22000.25,
        change: 45.75,
        changePercent: 0.21,
        volume: 987654,
        openInterest: 1876543,
        bid: 21998.50,
        ask: 22002.00,
        high: 22034.75,
        low: 21967.25,
        open: 21954.50,
        previousClose: 21954.50,
      },
      {
        symbol: "RELIANCE-FUT",
        name: "RELIANCE Futures",
        underlying: "RELIANCE",
        expiry: expiryDate,
        lotSize: 250,
        tickSize: 0.05,
        contractSize: 687500,
        marginRequired: 68750,
        lastPrice: 2750.50,
        change: 12.25,
        changePercent: 0.45,
        volume: 456789,
        openInterest: 987654,
        bid: 2749.75,
        ask: 2751.25,
        high: 2765.00,
        low: 2738.25,
        open: 2738.25,
        previousClose: 2738.25,
      },
      {
        symbol: "TCS-FUT",
        name: "TCS Futures",
        underlying: "TCS",
        expiry: expiryDate,
        lotSize: 125,
        tickSize: 0.05,
        contractSize: 506250,
        marginRequired: 50625,
        lastPrice: 4050.00,
        change: 35.50,
        changePercent: 0.88,
        volume: 234567,
        openInterest: 567890,
        bid: 4048.50,
        ask: 4051.50,
        high: 4062.75,
        low: 4014.50,
        open: 4014.50,
        previousClose: 4014.50,
      },
    ];
  }

  // Get all available futures contracts
  async getContracts(): Promise<FuturesContract[]> {
    // Simulate API delay
    await this.simulateDelay(100);
    return [...this.contracts];
  }

  // Get specific contract details
  async getContract(symbol: string): Promise<FuturesContract | null> {
    await this.simulateDelay(50);
    return this.contracts.find((c) => c.symbol === symbol) || null;
  }

  // Get real-time market data
  async getMarketData(): Promise<FuturesMarketData> {
    await this.simulateDelay(100);
    
    // Simulate price updates
    this.contracts.forEach((contract) => {
      const priceChange = (Math.random() - 0.5) * 10;
      contract.lastPrice += priceChange;
      contract.change += priceChange;
      contract.changePercent = (contract.change / contract.previousClose) * 100;
      contract.bid = contract.lastPrice - contract.tickSize;
      contract.ask = contract.lastPrice + contract.tickSize;
    });

    return {
      timestamp: Date.now(),
      contracts: [...this.contracts],
      indices: {
        niftyFutures: this.contracts[0].lastPrice,
        bankNiftyFutures: this.contracts[1].lastPrice,
        finniftyFutures: this.contracts[2].lastPrice,
      },
      marketStatus: "open",
    };
  }

  // Get historical data for backtesting
  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval: "1m" | "5m" | "15m" | "1h" | "1d" = "1d"
  ): Promise<FuturesHistoricalData[]> {
    await this.simulateDelay(200);

    const data: FuturesHistoricalData[] = [];
    const contract = this.contracts.find((c) => c.symbol === symbol);
    
    if (!contract) {
      throw new Error(`Contract ${symbol} not found`);
    }

    // Generate mock historical data
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = contract.lastPrice;
    
    for (let i = 0; i < Math.min(daysDiff, 500); i++) {
      const timestamp = startDate.getTime() + i * 24 * 60 * 60 * 1000;
      const trend = Math.sin(i / 20) * 100;
      const noise = (Math.random() - 0.5) * 50;
      const open = basePrice + trend + noise;
      const close = open + (Math.random() - 0.5) * 30;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000) + 500000,
        openInterest: Math.floor(Math.random() * 5000000) + 2000000,
      });
    }

    return data;
  }

  // Place a futures order
  async placeOrder(order: Omit<FuturesOrder, "orderId" | "timestamp" | "status">): Promise<FuturesOrder> {
    await this.simulateDelay(150);

    const newOrder: FuturesOrder = {
      ...order,
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: "PENDING",
    };

    // Simulate order execution
    setTimeout(() => {
      newOrder.status = "FILLED";
      newOrder.fillPrice = order.price;
      this.updatePosition(newOrder);
    }, 1000);

    this.orders.push(newOrder);
    return newOrder;
  }

  // Update position after order fill
  private updatePosition(order: FuturesOrder) {
    const existingPosition = this.positions.find((p) => p.symbol === order.symbol);
    const contract = this.contracts.find((c) => c.symbol === order.symbol);

    if (!contract) return;

    if (existingPosition) {
      if (order.type === "BUY") {
        existingPosition.quantity += order.quantity;
        existingPosition.entryPrice =
          (existingPosition.entryPrice * existingPosition.quantity + order.price * order.quantity) /
          (existingPosition.quantity + order.quantity);
      } else {
        existingPosition.quantity -= order.quantity;
      }
      
      existingPosition.currentPrice = contract.lastPrice;
      existingPosition.pnl = (existingPosition.currentPrice - existingPosition.entryPrice) * existingPosition.quantity;
      existingPosition.pnlPercent = (existingPosition.pnl / (existingPosition.entryPrice * existingPosition.quantity)) * 100;
    } else {
      this.positions.push({
        symbol: order.symbol,
        quantity: order.type === "BUY" ? order.quantity : -order.quantity,
        entryPrice: order.price,
        currentPrice: contract.lastPrice,
        pnl: 0,
        pnlPercent: 0,
        margin: contract.marginRequired,
        timestamp: Date.now(),
      });
    }
  }

  // Get current positions
  async getPositions(): Promise<FuturesPosition[]> {
    await this.simulateDelay(50);
    
    // Update current prices and P&L
    this.positions.forEach((position) => {
      const contract = this.contracts.find((c) => c.symbol === position.symbol);
      if (contract) {
        position.currentPrice = contract.lastPrice;
        position.pnl = (position.currentPrice - position.entryPrice) * position.quantity;
        position.pnlPercent = (position.pnl / (position.entryPrice * Math.abs(position.quantity))) * 100;
      }
    });

    return [...this.positions];
  }

  // Get order history
  async getOrders(): Promise<FuturesOrder[]> {
    await this.simulateDelay(50);
    return [...this.orders];
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<boolean> {
    await this.simulateDelay(50);
    const order = this.orders.find((o) => o.orderId === orderId);
    if (order && order.status === "PENDING") {
      order.status = "CANCELLED";
      return true;
    }
    return false;
  }

  // Calculate margin requirements
  calculateMargin(symbol: string, quantity: number): number {
    const contract = this.contracts.find((c) => c.symbol === symbol);
    if (!contract) return 0;
    return contract.marginRequired * (quantity / contract.lotSize);
  }

  // Get contract specifications
  async getContractSpecifications(symbol: string): Promise<Partial<FuturesContract> | null> {
    await this.simulateDelay(50);
    const contract = this.contracts.find((c) => c.symbol === symbol);
    if (!contract) return null;

    return {
      symbol: contract.symbol,
      name: contract.name,
      underlying: contract.underlying,
      expiry: contract.expiry,
      lotSize: contract.lotSize,
      tickSize: contract.tickSize,
      contractSize: contract.contractSize,
      marginRequired: contract.marginRequired,
    };
  }

  // Search contracts by underlying or symbol
  async searchContracts(query: string): Promise<FuturesContract[]> {
    await this.simulateDelay(50);
    const lowerQuery = query.toLowerCase();
    return this.contracts.filter(
      (c) =>
        c.symbol.toLowerCase().includes(lowerQuery) ||
        c.name.toLowerCase().includes(lowerQuery) ||
        c.underlying.toLowerCase().includes(lowerQuery)
    );
  }

  // Utility to simulate API delay
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const futuresAPI = new FuturesAPIService();
