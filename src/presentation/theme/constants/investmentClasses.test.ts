import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import {
  investmentClassColor,
  investmentClassColors,
} from "./investmentClasses";

const CLASSES = Object.values(InvestmentAssetClass);

it("SHOULD give every class a distinct color in both themes", () => {
  for (const theme of ["dark", "light"] as const) {
    const values = CLASSES.map((assetClass) =>
      investmentClassColor(theme === "dark", assetClass),
    );

    expect(new Set(values).size).toBe(values.length);
  }
});

it("SHOULD read the light palette for the light theme AND the dark one otherwise", () => {
  expect(investmentClassColor(false, InvestmentAssetClass.BR_STOCK)).toBe(
    investmentClassColors.light.BR_STOCK,
  );
  expect(investmentClassColor(true, InvestmentAssetClass.BR_STOCK)).toBe(
    investmentClassColors.dark.BR_STOCK,
  );
});
