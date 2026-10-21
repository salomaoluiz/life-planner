import {
  autoMatch,
  distinctValues,
  isSystemCategoryName,
  matchPaid,
  matchType,
} from "./distinctValues";

describe("distinctValues", () => {
  it("SHOULD count the trimmed non-empty values in first-seen order", () => {
    const rows = [["Mercado"], [" Mercado "], [""], ["Saúde"], [], ["Mercado"]];

    expect(distinctValues(rows, 0)).toEqual([
      { rows: 3, value: "Mercado" },
      { rows: 1, value: "Saúde" },
    ]);
  });
});

describe("autoMatch", () => {
  const categories = [
    { id: "a", names: ["Mercado", "Casa > Mercado"] },
    { id: "b", names: ["Saúde", "Saúde"] },
  ];

  it("SHOULD match ignoring case, accents and spaces", () => {
    expect(autoMatch("  SAUDE ", categories)).toBe("b");
    expect(autoMatch("mercado", categories)).toBe("a");
  });

  it("SHOULD match a full path with any separator", () => {
    expect(autoMatch("Casa / Mercado", categories)).toBe("a");
    expect(autoMatch("casa:mercado", categories)).toBe("a");
  });

  it("SHOULD return undefined without a match", () => {
    expect(autoMatch("Esporte", categories)).toBeUndefined();
  });
});

describe("matchType", () => {
  it.each([
    ["Receita", "INCOME"],
    ["income", "INCOME"],
    ["Crédito", "INCOME"],
    ["C", "INCOME"],
    ["+", "INCOME"],
    ["Despesa", "EXPENSE"],
    ["expense", "EXPENSE"],
    ["Débito", "EXPENSE"],
    ["D", "EXPENSE"],
    ["-", "EXPENSE"],
  ])("SHOULD read %s as %s", (value, expected) => {
    expect(matchType(value)).toBe(expected);
  });

  it("SHOULD not guess an unknown word", () => {
    expect(matchType("transfer")).toBeUndefined();
  });
});

describe("matchPaid", () => {
  it.each(["Sim", "yes", "Pago", "paid", "true", "1", "x"])(
    "SHOULD read %s as paid",
    (value) => {
      expect(matchPaid(value)).toBe(true);
    },
  );

  it.each(["Não", "no", "false", "0"])(
    "SHOULD read %s as not paid",
    (value) => {
      expect(matchPaid(value)).toBe(false);
    },
  );

  it("SHOULD use the default for an empty cell and leave an unknown word unmatched", () => {
    expect(matchPaid("")).toBe("default");
    expect(matchPaid("talvez")).toBeUndefined();
  });
});

describe("isSystemCategoryName", () => {
  it("SHOULD know the system category names in both languages", () => {
    expect(isSystemCategoryName("Ajuste de saldo")).toBe(true);
    expect(isSystemCategoryName("Balance adjustment")).toBe(true);
    // Spec 048: the card credits and the invoice payment are imported now, no longer skipped.
    expect(isSystemCategoryName("INVOICE PAYMENT")).toBe(false);
    expect(isSystemCategoryName("estorno no cartao")).toBe(false);
    expect(isSystemCategoryName("Mercado")).toBe(false);
  });
});
