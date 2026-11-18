import { StockUnits } from "@domain/entities/stock/StockEntity";

// FR 11 chips of the exact quantity sheet: 100 g / 500 g / step for kg/L, 1 / 2 / 6 for unit; "Tudo" is separate.
export function exactChips(item: {
  quickStep?: number;
  unit: StockUnits;
}): number[] {
  const base =
    item.unit === StockUnits.UNIT ? [1, 2, 6] : [0.1, 0.5, resolveStep(item)];

  return [...new Set(base)].sort((a, b) => a - b);
}

// Spec 117 FR 10: the − / + step of an item (null = 1 un, 1 kg or 1 L).
export function resolveStep(item: { quickStep?: number }): number {
  return item.quickStep ?? 1;
}
