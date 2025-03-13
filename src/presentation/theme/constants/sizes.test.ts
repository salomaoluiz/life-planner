import { Dimensions } from "react-native";

import getScaledSizes, { defaultSizes } from "./sizes";

const defaultDimensions = {
  fontScale: 1,
  height: 549,
  scale: 1,
  width: 285,
};

const dimensionsGetSpy = jest
  .spyOn(Dimensions, "get")
  .mockReturnValue(defaultDimensions);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD return the regular size FOR mobile", () => {
  const sizes = getScaledSizes();

  expect(sizes).toEqual(defaultSizes);
});

it("SHOULD return the scaled size FOR tablet", () => {
  dimensionsGetSpy.mockReturnValue({
    ...defaultDimensions,
    width: 600,
  });

  const sizes = getScaledSizes();

  expect(sizes).toEqual({
    borderRadius: { full: "50%", large: 19, medium: 10, small: 5, xlarge: 38 },
    fontSizes: {
      large: 31,
      medium: 21,
      small: 18,
      xlarge: 42,
      xsmall: 16,
      xxlarge: 62,
    },
    lineHeights: {
      large: 42,
      medium: 31,
      small: 26,
      xlarge: 62,
      xsmall: 21,
      xxlarge: 83,
    },
    spacing: {
      large: 34,
      medium: 22,
      small: 11,
      xlarge: 45,
      xsmall: 6,
      xxlarge: 67,
      xxxlarge: 90,
    },
  });
});

it("SHOULD return the scaled size FOR desktop", () => {
  dimensionsGetSpy.mockReturnValue({
    ...defaultDimensions,
    width: 1025,
  });

  const sizes = getScaledSizes();

  expect(sizes).toEqual({
    borderRadius: {
      full: "50%",
      large: 24,
      medium: 12,
      small: 6,
      xlarge: 48,
    },
    fontSizes: {
      large: 38,
      medium: 26,
      small: 22,
      xlarge: 51,
      xsmall: 19,
      xxlarge: 77,
    },
    lineHeights: {
      large: 51,
      medium: 38,
      small: 32,
      xlarge: 77,
      xsmall: 26,
      xxlarge: 102,
    },
    spacing: {
      large: 43,
      medium: 29,
      small: 14,
      xlarge: 58,
      xsmall: 7,
      xxlarge: 86,
      xxxlarge: 115,
    },
  });
});
