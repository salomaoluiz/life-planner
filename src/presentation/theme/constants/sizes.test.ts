import { Dimensions } from "react-native";

import getScaledSizes, { defaultSizes } from "./sizes";
import { getScaleFunctions, getScaleRatio, rescaleSizes } from "./utils/sizes";

const defaultDimensions = {
  fontScale: 1,
  height: 549,
  scale: 1,
  width: 285,
};

const dimensionsGetSpy = jest.spyOn(Dimensions, "get");

beforeEach(() => {
  jest.clearAllMocks();
  dimensionsGetSpy.mockReturnValue(defaultDimensions);
});

it.each([285, 600, 1280])(
  "SHOULD return the base sizes WHEN the width is %s (no per-breakpoint scaling)",
  (width) => {
    dimensionsGetSpy.mockReturnValue({ ...defaultDimensions, width });

    expect(getScaledSizes()).toEqual(defaultSizes);
  },
);

it("SHOULD define the spacing, radius and size scales", () => {
  expect(defaultSizes.spacing).toEqual({
    lg: 20,
    md: 16,
    sm: 12,
    xl: 24,
    xs: 8,
    xxl: 32,
    xxs: 4,
    xxxl: 48,
  });
  expect(defaultSizes.borderRadius).toEqual({
    full: 999,
    lg: 20,
    md: 14,
    sheet: 28,
    sm: 10,
  });
  expect(defaultSizes.size).toEqual({
    buttonHeight: 48,
    buttonHeightSheet: 54,
    contentMaxWidth: 720,
    formMaxWidth: 480,
    iconLg: 24,
    iconMd: 20,
    iconSm: 16,
    inputHeight: 50,
    tabBarHeight: 84,
    touchTarget: 44,
  });
});

it("SHOULD still rescale a one-off value with the helpers", () => {
  dimensionsGetSpy.mockReturnValue({ ...defaultDimensions, width: 600 });

  const scaled = rescaleSizes(
    defaultSizes.spacing,
    getScaleFunctions().scaleSpacing,
  );

  expect(scaled.md).toBe(Math.round(16 * 1.15));
});

it.each([
  { borderFactor: 1, scaleFactor: 1, spacingFactor: 1, width: 285 },
  { borderFactor: 1.15, scaleFactor: 1.15, spacingFactor: 1.15, width: 600 },
  { borderFactor: 1.3, scaleFactor: 1.3, spacingFactor: 1.3, width: 1025 },
])("SHOULD return the scale ratio FOR width $width", ({ width, ...ratio }) => {
  dimensionsGetSpy.mockReturnValue({ ...defaultDimensions, width });

  expect(getScaleRatio()).toEqual(ratio);
});
