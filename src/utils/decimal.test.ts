import { formatDecimal, mulToCents, parseDecimal, roundDiv } from "./decimal";

describe("parseDecimal", () => {
  it("SHOULD accept dot and comma separators with up to 8 places", () => {
    expect(formatDecimal(parseDecimal("18.3572") as bigint)).toBe("18.3572");
    expect(formatDecimal(parseDecimal("0,5") as bigint)).toBe("0.5");
    expect(formatDecimal(parseDecimal(" 1200 ") as bigint)).toBe("1200");
    expect(formatDecimal(parseDecimal("9999999999.99999999") as bigint)).toBe(
      "9999999999.99999999",
    );
  });

  it.each(["", "abc", "-1", "1.123456789", "1,2,3", "1e3", "."])(
    "SHOULD reject %p",
    (value) => {
      expect(parseDecimal(value)).toBeNull();
    },
  );
});

describe("formatDecimal", () => {
  it("SHOULD print the shortest form AND keep the sign", () => {
    expect(formatDecimal(BigInt(0))).toBe("0");
    expect(formatDecimal(BigInt(5))).toBe("0.00000005");
    expect(formatDecimal(BigInt(-150000000))).toBe("-1.5");
  });
});

describe("mulToCents", () => {
  it("SHOULD multiply to cents rounding half up", () => {
    expect(
      mulToCents(
        parseDecimal("500") as bigint,
        parseDecimal("10.20") as bigint,
      ),
    ).toBe(510000);
    expect(
      mulToCents(parseDecimal("1") as bigint, parseDecimal("0.005") as bigint),
    ).toBe(1);
    expect(
      mulToCents(parseDecimal("1") as bigint, parseDecimal("0.0049") as bigint),
    ).toBe(0);
    expect(
      mulToCents(parseDecimal("3") as bigint, parseDecimal("0.1") as bigint),
    ).toBe(30);
  });
});

describe("roundDiv", () => {
  it("SHOULD round half up", () => {
    expect(roundDiv(BigInt(5), BigInt(2))).toBe(BigInt(3));
    expect(roundDiv(BigInt(4), BigInt(3))).toBe(BigInt(1));
  });
});
