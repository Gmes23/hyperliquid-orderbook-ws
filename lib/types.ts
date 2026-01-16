export interface OrderBookLevel {
    px: string;
    sz: string;
    n: number;
  }
  
  export interface OrderBookData {
    coin: string;
    levels: [OrderBookLevel[], OrderBookLevel[]];
    time: number;
  }
  
  export interface ProcessedLevel {
    price: number;
    size: number;
    sizeUsdc: number;
    total: number;
    totalUsdc: number;
    priceStr: string;
    isNew: boolean;
  }
  
  export interface TradeData {
    coin: string;
    side: string;
    px: string;
    sz: string;
    time: number;
    hash: string;
  }
  
  export interface ProcessedTrade {
    price: string;
    size: number;
    sizeUsdc: number;
    side: 'buy' | 'sell';
    time: string;
    id: string;
  }
  
  export type Symbol = 'BTC' | 'ETH';
  export type Tab = 'orderbook' | 'trades';
  export type Denomination = 'asset' | 'usdc';