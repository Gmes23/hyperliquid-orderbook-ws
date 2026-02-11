'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import type { OrderBookLevel, OrderBookData, ProcessedLevel, Symbol } from '@/lib/types';
import { aggregateLevels } from '@/lib/orderbook';
import { NUM_ROWS } from '@/lib/constants';

interface UseOrderBookStateProps {
  symbol: Symbol;
  priceGrouping: number;
}

export function useOrderBookState({ symbol, priceGrouping }: UseOrderBookStateProps) {
  const [rawBids, setRawBids] = useState<OrderBookLevel[]>([]);
  const [rawAsks, setRawAsks] = useState<OrderBookLevel[]>([]);
  
  const knownBidPricesRef = useRef<Set<number>>(new Set());
  const knownAskPricesRef = useRef<Set<number>>(new Set());

  const skipFlashRef = useRef<boolean>(true);
  const currentSymbolRef = useRef<string>(symbol);


  // Ref storing current symbol to prevent processing stale WebSocket messages after symbol changes
  useEffect(() => {
    currentSymbolRef.current = symbol;
    setRawBids([]);
    setRawAsks([]);
    knownBidPricesRef.current = new Set();
    knownAskPricesRef.current = new Set();
    skipFlashRef.current = true;
  }, [symbol]);


  // Resets all state and refs to clear old symbols data
  useEffect(() => {
    knownBidPricesRef.current = new Set();
    knownAskPricesRef.current = new Set();
    skipFlashRef.current = true;
  }, [priceGrouping]);

  const processOrderBook = useCallback((data: OrderBookData) => {
    if (data.coin !== currentSymbolRef.current) {
      return;
    }

    const [bids, asks] = data.levels;
    setRawBids(bids);
    setRawAsks(asks);
  }, []);

  const { bids, asks, spread, maxBidTotal, maxAskTotal } = useMemo(() => {
    const shouldSkipFlash = skipFlashRef.current;
    
    const bidsResult = aggregateLevels(
      rawBids, 
      priceGrouping, 
      true,
      knownBidPricesRef.current,
      shouldSkipFlash
    );
    
    const asksResult = aggregateLevels(
      rawAsks, 
      priceGrouping, 
      false,
      knownAskPricesRef.current,
      shouldSkipFlash
    );
    
    // Update the refs with new known prices
    knownBidPricesRef.current = bidsResult.newKnownPrices;
    knownAskPricesRef.current = asksResult.newKnownPrices;


    // Update refs with newly seen prices for next renders flash detection.
    const aggregatedBids = bidsResult.levels.slice(0, NUM_ROWS);
    const aggregatedAsks = asksResult.levels.slice(0, NUM_ROWS);
    
    if (rawBids.length > 0 || rawAsks.length > 0) {
      skipFlashRef.current = false;
    }
    
    const displayAsks = [...aggregatedAsks].reverse();
    
    let spreadData = null;
    if (aggregatedBids.length > 0 && aggregatedAsks.length > 0) {
      const bestBid = aggregatedBids[0].price;
      const bestAsk = aggregatedAsks[0].price;
      const spreadValue = bestAsk - bestBid;
      const spreadPercentage = (spreadValue / bestAsk) * 100;
      spreadData = { value: spreadValue, percentage: spreadPercentage };
    }
    
    // Calculate bid/ask spread
    const maxBidTotalAsset = aggregatedBids.length > 0 
      ? Math.max(...aggregatedBids.map(b => b.total)) 
      : 0;
    const maxBidTotalUsdc = aggregatedBids.length > 0 
      ? Math.max(...aggregatedBids.map(b => b.totalUsdc)) 
      : 0;



    // Finding maximum cumulative total on bid side (in both asset units and USDC value) so wecan used for depth visualization bars. 
    const maxAskTotalAsset = displayAsks.length > 0 
      ? Math.max(...displayAsks.map(a => a.total)) 
      : 0;
    const maxAskTotalUsdc = displayAsks.length > 0 
      ? Math.max(...displayAsks.map(a => a.totalUsdc)) 
      : 0;
    
    return { 
      bids: aggregatedBids, 
      asks: displayAsks, 
      spread: spreadData,
      maxBidTotal: { asset: maxBidTotalAsset, usdc: maxBidTotalUsdc },
      maxAskTotal: { asset: maxAskTotalAsset, usdc: maxAskTotalUsdc }
    };
  }, [rawBids, rawAsks, priceGrouping]);

  // Creating the rows for the bid ask so its always the same number as NUM_ROWS if there are less than NUM_ROWs we leave them empty, rows[NUM_ROWS - 1 - i] = ask; is just reversing the order of the asks so the lowest ask price at the bottom near the spread
  const fixedAsks = useMemo(() => {
    const rows: (ProcessedLevel | null)[] = Array(NUM_ROWS).fill(null);
    asks.forEach((ask, i) => {
      rows[i] = ask;
    });
    return rows;
  }, [asks]);

  const fixedBids = useMemo(() => {
    const rows: (ProcessedLevel | null)[] = Array(NUM_ROWS).fill(null);
    bids.forEach((bid, i) => {
      rows[i] = bid;
    });
    return rows;
  }, [bids]);

  return {
    bids,
    asks,
    fixedBids,
    fixedAsks,
    spread,
    maxBidTotal,
    maxAskTotal,
    processOrderBook
  };
}