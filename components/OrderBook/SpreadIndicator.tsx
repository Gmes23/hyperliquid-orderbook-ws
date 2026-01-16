interface SpreadIndicatorProps {
    spread: {
      value: number;
      percentage: number;
    } | null;
  }
  
  export function SpreadIndicator({ spread }: SpreadIndicatorProps) {
    if (!spread) return null;
  
    return (
      <div className="px-4 py-3 bg-[#1e222d] border-y border-gray-800">
        <div className="grid grid-cols-3 items-center text-sm">
          {/* Left: Label  */}
          <div className="text-gray-500 text-left">
            Spread
          </div>
  
          {/* Center: Absolute spread */}
          <div className="text-center text-gray-300 font-mono">
            {spread.value.toFixed(2)}
          </div>
  
          {/* Right: Percentage */}
          <div className="text-right text-xs text-gray-500 font-mono">
            {spread.percentage.toFixed(3)}%
          </div>
        </div>
      </div>
    );
  }