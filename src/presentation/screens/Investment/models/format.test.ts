import {
  formatDay,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatResult,
  formatUnitPrice,
  resultTone,
} from "./format";

describe("formatDay", () => {
  it("SHOULD write the calendar day without shifting it", () => {
    expect(formatDay("2026-11-01", "pt-BR")).toBe("01/11/2026");
    expect(formatDay("2026-11-01", "en-US")).toBe("11/01/2026");
  });
});

describe("money", () => {
  it("SHOULD format cents in the asset currency", () => {
    expect(formatMoney(1263600, "BRL", "pt-BR")).toBe("R$ 12.636,00");
    expect(formatMoney(238810, "USD", "en-US")).toBe("$2,388.10");
  });

  it("SHOULD always write the sign of a result", () => {
    expect(formatResult(84960, "BRL", "pt-BR")).toBe("+R$ 849,60");
    expect(formatResult(-22800, "BRL", "pt-BR")).toBe("−R$ 228,00");
    expect(formatResult(0, "BRL", "pt-BR")).toBe("R$ 0,00");
  });

  it("SHOULD format a percent with its sign", () => {
    expect(formatPercent(0.0721, "pt-BR")).toBe("+7,21%");
    expect(formatPercent(-0.0239, "en-US")).toBe("−2.39%");
    expect(formatPercent(0, "en-US")).toBe("0.00%");
  });
});

describe("quantity and unit price", () => {
  it("SHOULD format a quantity keeping up to 8 decimals", () => {
    expect(formatQuantity("1200", "pt-BR")).toBe("1.200");
    expect(formatQuantity("18.3572", "pt-BR")).toBe("18,3572");
    expect(formatQuantity("18.3572", "en-US")).toBe("18.3572");
  });

  it("SHOULD format a unit price with its decimals or a fixed number of them", () => {
    expect(formatUnitPrice("10.53", "BRL", "pt-BR")).toBe("R$ 10,53");
    expect(formatUnitPrice("114.6345", "USD", "pt-BR")).toBe("US$ 114,6345");
    expect(formatUnitPrice("9.822", "BRL", "pt-BR", 4)).toBe("R$ 9,8220");
  });
});

describe("resultTone", () => {
  it("SHOULD pick the tone of the sign", () => {
    expect(resultTone(10)).toBe("income");
    expect(resultTone(-10)).toBe("expense");
    expect(resultTone(0)).toBe("secondary");
    expect(resultTone(null)).toBe("secondary");
  });
});
