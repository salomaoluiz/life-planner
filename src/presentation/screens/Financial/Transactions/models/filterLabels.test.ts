import { formatPeriod, namesLabel } from "./filterLabels";

describe("namesLabel", () => {
  it("SHOULD list up to two names and fold the rest into +N", () => {
    expect(namesLabel(["Mercado"])).toBe("Mercado");
    expect(namesLabel(["Mercado", "Farmácia"])).toBe("Mercado, Farmácia");
    expect(namesLabel(["Mercado", "Farmácia", "Moradia", "Salário"])).toBe(
      "Mercado +3",
    );
  });
});

describe("formatPeriod", () => {
  it("SHOULD format both ends in the active language", () => {
    expect(
      formatPeriod({ from: "2025-01-01", to: "2026-02-28" }, "pt-BR"),
    ).toBe("01/01/2025 – 28/02/2026");
  });
});
