import { cleanBarcode, expandUpcE, locationIdFromLink } from "./barcode";

describe("cleanBarcode", () => {
  it("SHOULD drop spaces and hyphens", () => {
    expect(cleanBarcode(" 7891000 100-103 ")).toBe("7891000100103");
  });

  it.each(["", "   ", "a$b", "x".repeat(65)])("SHOULD refuse %j", (value) => {
    expect(cleanBarcode(value)).toBeUndefined();
  });
});

describe("expandUpcE", () => {
  it.each([
    ["04252614", "042100005264"],
    ["01234565", "012345000065"],
  ])("SHOULD expand %s to %s", (input, expected) => {
    expect(expandUpcE(input)).toBe(expected);
  });
});

describe("locationIdFromLink", () => {
  const base = "https://app.example.com/";

  it("SHOULD read the location id of a stock location link", () => {
    expect(
      locationIdFromLink(
        "https://app.example.com/stock/locations/abc?x=1",
        base,
      ),
    ).toBe("abc");
  });

  it.each([
    ["another site", "https://other.example.com/stock/locations/abc"],
    ["a barcode", "7891000100103"],
    ["no id", "https://app.example.com/stock/locations/"],
  ])("SHOULD ignore %s", (_label, text) => {
    expect(locationIdFromLink(text, base)).toBeUndefined();
  });

  it("SHOULD ignore everything WITHOUT a web base", () => {
    expect(
      locationIdFromLink("/stock/locations/abc", undefined),
    ).toBeUndefined();
  });
});
