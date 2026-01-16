'use client';

import { useState, useEffect } from 'react';
import { OrderBookHeader } from '@/components/OrderBook/OrderBookHeader';
import { OrderBookTable } from '@/components/OrderBook/OrderBookTable';
import { TradesTable } from '@/components/OrderBook/TradesTable';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useOrderBookState } from '@/hooks/useOrderBookState';
import { useTrades } from '@/hooks/useTrades';
import type { Symbol, Tab, Denomination } from '@/lib/types';

export default function OrderBook() {
  const [symbol, setSymbol] = useState<Symbol>('BTC');
  const [priceGrouping, setPriceGrouping] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<Tab>('orderbook');
  const [denomination, setDenomination] = useState<Denomination>('asset');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Custom hooks
  const { 
    fixedBids, 
    fixedAsks, 
    spread, 
    maxBidTotal, 
    maxAskTotal,
    processOrderBook 
  } = useOrderBookState({ symbol, priceGrouping });
  
  const { trades, processTrades, resetTrades } = useTrades({ symbol });
  
  const { isConnected } = useWebSocket({
    symbol,
    onOrderBookUpdate: processOrderBook,
    onTradesUpdate: processTrades
  });

  // Reset trades when symbol changes
  useEffect(() => {
    resetTrades();
    setPriceGrouping(symbol === 'BTC' ? 1 : 0.1);
  }, [symbol, resetTrades]);

  return (
    <div className="min-h-screen bg-[#0a0e13] text-white p-4">
      <div className="max-w-md mx-auto">
        <OrderBookHeader
          symbol={symbol}
          setSymbol={setSymbol}
          priceGrouping={priceGrouping}
          setPriceGrouping={setPriceGrouping}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          denomination={denomination}
          setDenomination={setDenomination}
          isConnected={isConnected}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        {activeTab === 'orderbook' ? (
          <OrderBookTable
            fixedAsks={fixedAsks}
            fixedBids={fixedBids}
            spread={spread}
            maxAskTotal={denomination === 'asset' ? maxAskTotal.asset : maxAskTotal.usdc}
            maxBidTotal={denomination === 'asset' ? maxBidTotal.asset : maxBidTotal.usdc}
            denomination={denomination}
            symbol={symbol}
          />
        ) : (
          <TradesTable
            trades={trades}
            denomination={denomination}
            symbol={symbol}
          />
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-600">
          {isConnected ? (
            <span className="text-green-500">● Live</span>
          ) : (
            <span className="text-red-500">● Disconnected</span>
          )}
        </div>
      </div>
    </div>
  );
}