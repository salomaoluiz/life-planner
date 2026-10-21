import { fluidSheetSize } from "./fluidSize";

describe("fluidSheetSize", () => {
  it.each([
    [1920, 1080, { height: 960, width: 1440 }],
    [1280, 800, { height: 736, width: 1216 }],
    [1104, 700, { height: 636, width: 1040 }],
    [1500, 2000, { height: 960, width: 1436 }],
  ])("SHOULD size a %sx%s window as %j", (width, height, expected) => {
    expect(fluidSheetSize({ height, width })).toEqual(expected);
  });

  it("SHOULD fall back to the 047 sheet below 1040 px of window", () => {
    expect(fluidSheetSize({ height: 800, width: 1039 })).toBeUndefined();
  });
});
