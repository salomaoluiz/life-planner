import { StockUnits } from "@domain/entities/stock/StockEntity";

import {
  applyInput,
  formatAmount,
  initialInput,
  isBulk,
  QuantityMode,
  roundQuantity,
  toDisplay,
  toQuantity,
} from "./stockQuantity";

describe("toDisplay", () => {
  it.each([
    [0.999, StockUnits.KILOGRAM, 999, "gram"],
    [1, StockUnits.KILOGRAM, 1, "kilogram"],
    [1.5, StockUnits.KILOGRAM, 1.5, "kilogram"],
    [0.25, StockUnits.LITER, 250, "milliliter"],
    [0.4, StockUnits.KILOGRAM, 400, "gram"],
    [12.3456, StockUnits.LITER, 12.346, "liter"],
    [3, StockUnits.UNIT, 3, "unit"],
  ])("SHOULD show %s of %s as %s %s", (quantity, unit, amount, unitKey) => {
    expect(toDisplay(quantity, unit)).toEqual({ amount, unitKey });
  });
});

describe("formatAmount", () => {
  it("SHOULD use the locale decimal separator with up to 3 decimals", () => {
    expect(formatAmount(1.5, "pt-BR")).toBe("1,5");
    expect(formatAmount(1.2345, "en-US")).toBe("1.235");
  });
});

describe("applyInput", () => {
  const empty = { mode: QuantityMode.SMALL, text: "" };

  it("SHOULD keep typing in g below 1000 AND switch to kg at 1000 (1500 g -> 1,5 kg)", () => {
    expect(applyInput(empty, "999", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.SMALL,
      text: "999",
    });
    expect(applyInput(empty, "1000", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "1",
    });
    expect(applyInput(empty, "1500", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "1,5",
    });
  });

  it("SHOULD switch back to g WHEN the kg value drops below 1", () => {
    const large = { mode: QuantityMode.LARGE, text: "1,5" };

    expect(applyInput(large, "0,25", StockUnits.LITER)).toEqual({
      mode: QuantityMode.SMALL,
      text: "250",
    });
  });

  it("SHOULD not switch WHILE the separator is still being typed", () => {
    const large = { mode: QuantityMode.LARGE, text: "1,5" };

    expect(applyInput(large, "0,", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "0,",
    });
    expect(applyInput(large, "0", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "0",
    });
    expect(applyInput(large, "", StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "",
    });
  });

  it.each([
    ["letters in g mode", empty, "1a", StockUnits.KILOGRAM],
    ["a separator in g mode", empty, "1,5", StockUnits.LITER],
    ["a decimal on a UNIT item", empty, "1,5", StockUnits.UNIT],
    [
      "4 decimals in kg mode",
      { mode: QuantityMode.LARGE, text: "1" },
      "1,2345",
      StockUnits.KILOGRAM,
    ],
  ])("SHOULD refuse %s", (_label, previous, typed, unit) => {
    expect(applyInput(previous, typed, unit)).toBe(previous);
  });

  it("SHOULD take whole numbers only for UNIT items, with no mode switch", () => {
    expect(applyInput(empty, "2000", StockUnits.UNIT)).toEqual({
      mode: QuantityMode.SMALL,
      text: "2000",
    });
  });
});

describe("toQuantity / initialInput", () => {
  it.each([
    [{ mode: QuantityMode.SMALL, text: "400" }, StockUnits.KILOGRAM, 0.4],
    [{ mode: QuantityMode.LARGE, text: "1,5" }, StockUnits.KILOGRAM, 1.5],
    [{ mode: QuantityMode.LARGE, text: "1.25" }, StockUnits.LITER, 1.25],
    [{ mode: QuantityMode.SMALL, text: "3" }, StockUnits.UNIT, 3],
    [{ mode: QuantityMode.SMALL, text: "" }, StockUnits.UNIT, undefined],
    [{ mode: QuantityMode.LARGE, text: "1," }, StockUnits.KILOGRAM, 1],
    [{ mode: QuantityMode.SMALL, text: "1,5" }, StockUnits.UNIT, undefined],
  ])("SHOULD read %j of %s as %s", (input, unit, expected) => {
    expect(toQuantity(input, unit)).toBe(expected);
  });

  it("SHOULD round-trip a stored quantity into the field", () => {
    expect(initialInput(undefined, StockUnits.UNIT)).toEqual({
      mode: QuantityMode.SMALL,
      text: "",
    });
    expect(initialInput(1.5, StockUnits.KILOGRAM)).toEqual({
      mode: QuantityMode.LARGE,
      text: "1,5",
    });
    expect(initialInput(0.25, StockUnits.LITER)).toEqual({
      mode: QuantityMode.SMALL,
      text: "250",
    });
    expect(initialInput(4, StockUnits.UNIT)).toEqual({
      mode: QuantityMode.SMALL,
      text: "4",
    });
  });
});

describe("helpers", () => {
  it("SHOULD round to 3 decimals and tell bulk units apart", () => {
    expect(roundQuantity(0.30000000000000004)).toBe(0.3);
    expect(roundQuantity(1.23456)).toBe(1.235);
    expect(isBulk(StockUnits.LITER)).toBe(true);
    expect(isBulk(StockUnits.UNIT)).toBe(false);
  });
});
