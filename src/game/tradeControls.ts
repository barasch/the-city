export function normalizeTradeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function maximumTradeQuantity(
  maxBuyQuantity: number,
  ownedQuantity: number,
): number {
  return Math.max(
    normalizeTradeQuantity(maxBuyQuantity),
    normalizeTradeQuantity(ownedQuantity),
  );
}
