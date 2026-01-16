import type { OrderBookLevel, ProcessedLevel } from './types';


export function quantizePrice(price: number, step: number, isBid: boolean): number {
  if (step >= 1) {
    return isBid
      ? Math.floor(price / step) * step
      : Math.ceil(price / step) * step;
  }

  const factor = Math.round(1 / step);
  const ticks = price * factor;

  const qTicks = isBid
    ? Math.floor(ticks + 1e-9)
    : Math.ceil(ticks - 1e-9);

  return qTicks / factor;
}

/**
 * Aggregates orderbook levels into price buckets based on the grouping parameter.
 * 
 * This client-side grouping approach allows us to:
 * 1. Subscribe once with full precision (nSigFigs=null) 
 * 2. Dynamically adjust grouping without reconnecting the WebSocket
 * 3. Improve rendering performance by reducing the number of displayed rows
 * 4. Avoid latency from repeatedly opening/closing WebSocket connections
 * 
 * @param levels - Raw orderbook levels from WebSocket
 * @param grouping - Price increment for bucketing (e.g., 0.01, 0.5, 1, 5)
 * @param isBids - Whether these are bid levels (affects rounding direction)
 * @param knownPrices - Set of previously seen prices for flash detection
 * @param shouldSkipFlash - Whether to skip flash animations (e.g., on initial load)
 * @returns Aggregated levels with cumulative totals and newly seen prices
 */
export function aggregateLevels(
  levels: OrderBookLevel[], 
  grouping: number, 
  isBids: boolean,
  knownPrices: Set<number>,
  shouldSkipFlash: boolean
): { levels: ProcessedLevel[], newKnownPrices: Set<number> } {
  const aggregated = new Map<number, { size: number; sizeUsdc: number }>();
  
  for (const level of levels) {
    const price = parseFloat(level.px);
    const size = parseFloat(level.sz);
    const sizeUsdc = size * price;
    
    const roundedPrice = quantizePrice(price, grouping, isBids);
    
    const existing = aggregated.get(roundedPrice) || { size: 0, sizeUsdc: 0 };
    aggregated.set(roundedPrice, {
      size: existing.size + size,
      sizeUsdc: existing.sizeUsdc + sizeUsdc,
    });
  }
  
  let entries = Array.from(aggregated.entries());
  entries.sort((a, b) => isBids ? b[0] - a[0] : a[0] - b[0]);
  
  const result: ProcessedLevel[] = [];
  let runningTotal = 0;
  let runningTotalUsdc = 0;
  const newKnownPrices = new Set<number>();
  
  const decimals = grouping >= 1 ? 0 : Math.abs(Math.floor(Math.log10(grouping)));
  
  for (const [price, { size, sizeUsdc }] of entries) {
    runningTotal += size;
    runningTotalUsdc += sizeUsdc;

    const isNew = !shouldSkipFlash && !knownPrices.has(price);
    newKnownPrices.add(price);
    
    result.push({
      price,
      size,
      sizeUsdc,
      total: runningTotal,
      totalUsdc: runningTotalUsdc,
      priceStr: price.toFixed(decimals),
      isNew,
    });
  }
  
  return { levels: result, newKnownPrices };
}