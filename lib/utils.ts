import type { Symbol, Denomination } from './types';

export const quantizePrice = (price: number, step: number, isBid: boolean): number => {
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
};

export const formatGrouping = (value: number): string => {
  if (value >= 1) return value.toFixed(0);
  return value.toString();
};

export const formatSize = (
  assetSize: number, 
  usdcSize: number, 
  denomination: Denomination
): string => {
  if (denomination === 'asset') {
    return assetSize.toFixed(4);
  }
  return usdcSize.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const formatTotal = (
  assetTotal: number, 
  usdcTotal: number, 
  denomination: Denomination
): string => {
  if (denomination === 'asset') {
    return assetTotal.toFixed(4);
  }
  return usdcTotal.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const getDenomLabel = (denomination: Denomination, symbol: Symbol): string => {
  return denomination === 'asset' ? symbol : 'USDC';
};