import { DEFAULT_CURRENCY, toCurrencyCode } from "./Currency";

describe("toCurrencyCode", () => {
  it("SHOULD keep a supported code", () => {
    expect(toCurrencyCode("USD")).toBe("USD");
    expect(toCurrencyCode("EUR")).toBe("EUR");
  });

  it("SHOULD fall back to BRL WHEN the code is missing or unknown", () => {
    expect(toCurrencyCode(undefined)).toBe("BRL");
    expect(toCurrencyCode(null)).toBe("BRL");
    expect(toCurrencyCode("XYZ")).toBe("BRL");
    expect(toCurrencyCode("usd")).toBe("BRL");
    expect(DEFAULT_CURRENCY).toBe("BRL");
  });
});
