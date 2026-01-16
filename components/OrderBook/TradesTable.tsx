import type { ProcessedTrade, Denomination, Symbol } from '@/lib/types';
import { formatSize, getDenomLabel } from '@/lib/utils';

interface TradesTableProps {
  trades: ProcessedTrade[];
  denomination: Denomination;
  symbol: Symbol;
}

export function TradesTable({ trades, denomination, symbol }: TradesTableProps) {
  const denomLabel = getDenomLabel(denomination, symbol);

  return (
    <div className="bg-[#131722] rounded-lg overflow-hidden">
      {/* Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
        <div className="text-left">Price</div>
        <div className="text-center">Size ({denomLabel})</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="min-h-[1000px] max-h-[1000px] overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 gap-2 px-4 py-1.5 text-sm hover:bg-[#1e222d] transition-colors"
          >
            <div
              className={`font-mono text-left ${
                trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trade.price}
            </div>

            <div className="text-center text-gray-300 font-mono">
              {formatSize(trade.size, trade.sizeUsdc, denomination)}
            </div>

            <div className="text-right text-gray-500 text-xs">
              {trade.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}