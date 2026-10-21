import { buildActiveChips, formatPeriod, namesLabel } from "./filterLabels";
import { EMPTY_FILTERS } from "./transactionFilters";

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

describe("buildActiveChips", () => {
  const names = {
    categories: new Map([
      ["c1", "Mercado"],
      ["c2", "Farmácia"],
    ]),
    sources: new Map([["k1", "Cartão"]]),
    tags: new Map([
      ["t1", "gasto-fixo"],
      ["t2", "Gasto-Fixo"],
    ]),
  };

  function t(key: string, params?: Record<string, string>) {
    return params ? `${key}:${Object.values(params).join("|")}` : key;
  }

  it("SHOULD build one chip per group, in the order of the badge", () => {
    const chips = buildActiveChips(
      {
        ...EMPTY_FILTERS,
        cardIds: ["k1"],
        categoryIds: ["c1", "c2"],
        origin: "CARD",
        period: { from: "2025-01-01", to: "2025-02-28" },
        situation: "UNPAID",
        tagIds: ["t1", "t2"],
      },
      names,
      "en-US",
      t as never,
    );

    expect(chips.map((chip) => chip.group)).toEqual([
      "period",
      "origin",
      "sources",
      "categories",
      "tags",
      "situation",
    ]);
    expect(chips[3].label).toBe(
      "financial.transactions.filters.chip.categories:Mercado, Farmácia",
    );
    expect(chips[4].label).toBe(
      "financial.transactions.filters.chip.tags:gasto-fixo",
    );
  });

  it("SHOULD keep a chip for an id nobody can see", () => {
    const [chip] = buildActiveChips(
      { ...EMPTY_FILTERS, categoryIds: ["gone"] },
      names,
      "en-US",
      t as never,
    );

    expect(chip.label).toBe("financial.transactions.filters.chip.categories:…");
  });

  it("SHOULD build no chip without filters", () => {
    expect(buildActiveChips(EMPTY_FILTERS, names, "en-US", t as never)).toEqual(
      [],
    );
  });
});
