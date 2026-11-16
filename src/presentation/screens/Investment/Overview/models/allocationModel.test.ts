import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import toAllocationSlices from "./allocationModel";

const colors = {
  BR_REIT: "#2",
  BR_STOCK: "#1",
  FIXED_INCOME: "#4",
  FOREIGN_STOCK: "#3",
  PRIVATE: "#5",
} as const;
const usd = {
  fxRate: "5.5601",
  resultFromAsset: 695_403,
  resultFromFx: 217_228,
  value: "7293.15",
};

it("SHOULD give each slice its label, its colour AND its share", () => {
  const slices = toAllocationSlices(
    [
      {
        assetClass: InvestmentAssetClass.BR_STOCK,
        share: 0.34,
        value: 6_266_899,
      },
      {
        assetClass: InvestmentAssetClass.FOREIGN_STOCK,
        share: 0.22,
        usd,
        value: 4_055_052,
      },
    ],
    (assetClass) => `label ${assetClass}`,
    colors,
  );

  expect(slices).toEqual([
    {
      id: "BR_STOCK",
      label: "label BR_STOCK",
      share: 0.34,
      swatch: "#1",
      usd: undefined,
      value: 6_266_899,
    },
    {
      id: "FOREIGN_STOCK",
      label: "label FOREIGN_STOCK",
      share: 0.22,
      swatch: "#3",
      usd,
      value: 4_055_052,
    },
  ]);
});

it("SHOULD give no slices for no allocation", () => {
  expect(toAllocationSlices([], () => "x", colors)).toEqual([]);
});
