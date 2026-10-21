import { parseAmountCents, parseDate, parseInvoiceMonth } from "./parseValues";

describe("parseAmountCents", () => {
  it.each([
    ["R$ 1.234,56", ",", 123456, false],
    ["(45,00)", ",", 4500, true],
    ["-12.5", ".", 1250, true],
    ["1,234.56", ".", 123456, false],
    ["5.200,00", ",", 520000, false],
    ["12-", ",", 1200, true],
    ["−7,5", ",", 750, true],
    ["0,05", ",", 5, false],
    [" 31240 ", ",", 3124000, false],
  ])(
    "SHOULD read %s with decimal %s as %d cents",
    (raw, decimal, cents, negative) => {
      expect(parseAmountCents(raw, decimal as "," | ".")).toEqual({
        cents,
        negative,
      });
    },
  );

  it.each(["", "0", "0,00", "abc", "12,345", "1,2,3", "99999999999"])(
    "SHOULD refuse %j",
    (raw) => {
      expect(parseAmountCents(raw, ",")).toBeUndefined();
    },
  );
});

describe("parseDate", () => {
  it("SHOULD follow the chosen format for the same text (03/04/26)", () => {
    expect(parseDate("03/04/26", "dd/mm/yyyy")).toBe("2026-04-03");
    expect(parseDate("03/04/26", "mm/dd/yyyy")).toBe("2026-03-04");
  });

  it("SHOULD accept yyyy-mm-dd and dot or dash separators", () => {
    expect(parseDate("2026-10-02", "yyyy-mm-dd")).toBe("2026-10-02");
    expect(parseDate("02.10.2026", "dd/mm/yyyy")).toBe("2026-10-02");
    expect(parseDate("2-10-2026", "dd/mm/yyyy")).toBe("2026-10-02");
  });

  it("SHOULD map 2-digit years to 2000-2069 and 1970-1999", () => {
    expect(parseDate("01/01/69", "dd/mm/yyyy")).toBe("2069-01-01");
    expect(parseDate("01/01/70", "dd/mm/yyyy")).toBe("1970-01-01");
  });

  it.each([
    "31/09/2026",
    "29/02/2027",
    "00/10/2026",
    "02/13/2026",
    "01/01/1899",
    "01/01/2101",
    "01/01/202",
    "x",
  ])("SHOULD refuse %s instead of rolling it over", (raw) => {
    expect(parseDate(raw, "dd/mm/yyyy")).toBeUndefined();
  });
});

describe("parseInvoiceMonth", () => {
  it.each([
    ["09/2026", "2026-09"],
    ["9/26", "2026-09"],
    ["2026-09", "2026-09"],
    ["09.2026", "2026-09"],
    ["09-26", "2026-09"],
    ["2026/9", "2026-09"],
  ])("SHOULD read %s as %s", (raw, expected) => {
    expect(parseInvoiceMonth(raw)).toBe(expected);
  });

  it.each(["13/2026", "00/2026", "abc", "09", "2026-13"])(
    "SHOULD refuse %s",
    (raw) => {
      expect(parseInvoiceMonth(raw)).toBeUndefined();
    },
  );
});
