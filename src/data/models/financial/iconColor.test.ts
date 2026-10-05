import { fromApiColor, toApiColor } from "./iconColor";

describe("toApiColor", () => {
  it("SHOULD map the app's black token to #000000", () => {
    expect(toApiColor("black")).toBe("#000000");
  });

  it.each(["#007bff", "#8A2BE2", "#4cd137"])(
    "SHOULD keep the hex color %s",
    (color) => {
      expect(toApiColor(color)).toBe(color);
    },
  );
});

describe("fromApiColor", () => {
  it.each(["#000000", "#000000".toUpperCase()])(
    "SHOULD map %s back to the black token",
    (color) => {
      expect(fromApiColor(color)).toBe("black");
    },
  );

  it("SHOULD keep any other hex color", () => {
    expect(fromApiColor("#2E7D32")).toBe("#2E7D32");
  });

  it.each([undefined, null, 5])("SHOULD fall back to black for %j", (value) => {
    expect(fromApiColor(value)).toBe("black");
  });
});
