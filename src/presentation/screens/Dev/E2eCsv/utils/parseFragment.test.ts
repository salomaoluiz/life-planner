import { parseE2eCsvFragment } from "./parseFragment";

describe("parseE2eCsvFragment", () => {
  it("SHOULD read the name and the url-encoded text", () => {
    const csv = "Data;Valor\n02/10/2026;1,00";

    expect(
      parseE2eCsvFragment(`#name=extrato.csv&csv=${encodeURIComponent(csv)}`),
    ).toEqual({ csv, name: "extrato.csv" });
  });

  it("SHOULD name the file itself WHEN no name is given", () => {
    expect(parseE2eCsvFragment("#csv=a%3Bb")).toEqual({
      csv: "a;b",
      name: "e2e.csv",
    });
  });

  it("SHOULD return null without a csv", () => {
    expect(parseE2eCsvFragment("#name=x.csv")).toBeNull();
    expect(parseE2eCsvFragment("")).toBeNull();
  });
});
