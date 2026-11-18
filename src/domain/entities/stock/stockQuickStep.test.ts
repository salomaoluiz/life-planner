import { StockUnits } from "@domain/entities/stock/StockEntity";

import { exactChips, resolveStep } from "./stockQuickStep";

it("SHOULD default the step to 1 and use the item step when set", () => {
  expect(resolveStep({})).toBe(1);
  expect(resolveStep({ quickStep: 0.5 })).toBe(0.5);
});

it("SHOULD offer 100 g / 500 g / step for kg and L, deduplicated", () => {
  expect(exactChips({ quickStep: 0.25, unit: StockUnits.KILOGRAM })).toEqual([
    0.1, 0.25, 0.5,
  ]);
  expect(exactChips({ quickStep: 0.5, unit: StockUnits.LITER })).toEqual([
    0.1, 0.5,
  ]);
});

it("SHOULD offer 1 / 2 / 6 for unit items", () => {
  expect(exactChips({ unit: StockUnits.UNIT })).toEqual([1, 2, 6]);
});
