import type { ProcessedLevel, Denomination, Symbol } from '@/lib/types';
import { OrderBookRow } from './OrderBookRow';
import { SpreadIndicator } from './SpreadIndicator';
import { getDenomLabel } from '@/lib/utils';

interface OrderBookTableProps {
  fixedAsks: (ProcessedLevel | null)[];
  fixedBids: (ProcessedLevel | null)[];
  spread: { value: number; percentage: number } | null;
  maxAskTotal: number;
  maxBidTotal: number;
  denomination: Denomination;
  symbol: Symbol;
}

export function OrderBookTable({
  fixedAsks,
  fixedBids,
  spread,
  maxAskTotal,
  maxBidTotal,
  denomination,
  symbol
}: OrderBookTableProps) {
  const denomLabel = getDenomLabel(denomination, symbol);

  return (
    <div className="bg-[#131722] rounded-lg overflow-hidden">
      {/* Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
        <div className="text-left">Price</div>
        <div className="text-center">Size ({denomLabel})</div>
        <div className="text-right">Total ({denomLabel})</div>
      </div>

      {/* Asks */}
      <div className="relative">
        {fixedAsks.map((ask, index) => {
          const depthValue = ask 
            ? (denomination === 'asset' ? ask.total : ask.totalUsdc) 
            : 0;
          const depthPercentage = maxAskTotal > 0 ? (depthValue / maxAskTotal) * 100 : 0;
          
          return (
            <OrderBookRow
              key={`ask-row-${index}`}
              level={ask}
              side="ask"
              depthPercentage={depthPercentage}
              denomination={denomination}
            />
          );
        })}
      </div>

      {/* Spread */}
      <SpreadIndicator spread={spread} />

      {/* Bids */}
      <div className="relative">
        {fixedBids.map((bid, index) => {
          const depthValue = bid 
            ? (denomination === 'asset' ? bid.total : bid.totalUsdc) 
            : 0;
          const depthPercentage = maxBidTotal > 0 ? (depthValue / maxBidTotal) * 100 : 0;
          
          return (
            <OrderBookRow
              key={`bid-row-${index}`}
              level={bid}
              side="bid"
              depthPercentage={depthPercentage}
              denomination={denomination}
            />
          );
        })}
      </div>
    </div>
  );
}