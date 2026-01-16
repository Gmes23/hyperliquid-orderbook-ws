'use client';

import { useState, useRef, useCallback } from 'react';
import type { TradeData, ProcessedTrade, Symbol } from '@/lib/types';
import { MAX_TRADES } from '@/lib/constants';

interface UseTradesProps {
  symbol: Symbol;
}

export function useTrades({ symbol }: UseTradesProps) {
  const [trades, setTrades] = useState<ProcessedTrade[]>([]);
  const tradeIdCounterRef = useRef<number>(0);
  const currentSymbolRef = useRef<string>(symbol);

  const processTrades = useCallback((tradeData: TradeData[]) => {
    if (tradeData.length > 0 && tradeData[0].coin !== currentSymbolRef.current) {
      return;
    }

    const newTrades = tradeData.map(trade => {
      const id = `trade-${tradeIdCounterRef.current++}`;
      const price = parseFloat(trade.px);
      const size = parseFloat(trade.sz);
      const decimals = currentSymbolRef.current === 'BTC' ? 0 : 2;

      return {
        price: price.toFixed(decimals),
        size,
        sizeUsdc: size * price,
        side: trade.side === 'B' ? 'buy' as const : 'sell' as const,
        time: new Date(trade.time).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        id,
      };
    });

    setTrades(prev => [...newTrades, ...prev].slice(0, MAX_TRADES));
  }, []);

  const resetTrades = useCallback(() => {
    setTrades([]);
    tradeIdCounterRef.current = 0;
  }, []);

  // Update current symbol ref
  currentSymbolRef.current = symbol;

  return { trades, processTrades, resetTrades };
}