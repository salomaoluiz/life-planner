import { detectDateFormat, detectDecimal, detectSeparator } from "./detect";

describe("detectSeparator", () => {
  it("SHOULD pick the separator that splits every line the same way", () => {
    expect(
      detectSeparator(["Data;Valor;Obs", "02/10;1,5;a", "03/10;2,5;b"]),
    ).toBe(";");
    expect(detectSeparator(["Date,Amount", "2026-10-02,1.5"])).toBe(",");
    expect(detectSeparator(["Date\tAmount", "2026-10-02\t1.5"])).toBe("\t");
  });

  it("SHOULD not count a separator inside quotes", () => {
    expect(
      detectSeparator(["Data;Desc", '02/10;"a, b, c"', '03/10;"d, e"']),
    ).toBe(";");
  });

  it("SHOULD default when the header has no separator at all", () => {
    expect(detectSeparator(["Data"])).toBe(",");
    expect(detectSeparator([])).toBe(";");
  });
});

describe("detectDecimal", () => {
  it.each([
    [["1.234,56", "12,5", "-3,00"], ","],
    [["1,234.56", "12.5", "-3.00"], "."],
    [["R$ 1.234,56"], ","],
    [["-12.5"], "."],
  ])("SHOULD read %j as decimal %s", (samples, expected) => {
    expect(detectDecimal(samples)).toBe(expected);
  });

  it("SHOULD not let a lone thousands group vote", () => {
    expect(detectDecimal(["1.234", "5.000", "7,5"])).toBe(",");
  });
});

describe("detectDateFormat", () => {
  it("SHOULD know yyyy-mm-dd, also with dots", () => {
    expect(detectDateFormat(["2026-10-02"])).toBe("yyyy-mm-dd");
    expect(detectDateFormat(["2026.10.02"])).toBe("yyyy-mm-dd");
  });

  it("SHOULD use a part over 12 to tell day from month", () => {
    expect(detectDateFormat(["13/10/2026"])).toBe("dd/mm/yyyy");
    expect(detectDateFormat(["10/13/2026"])).toBe("mm/dd/yyyy");
  });

  it("SHOULD default to dd/mm/yyyy when nothing proves otherwise (03/04/26)", () => {
    expect(detectDateFormat(["03/04/26", "05/06/26"])).toBe("dd/mm/yyyy");
  });
});
