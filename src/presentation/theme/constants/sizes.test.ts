import getScaledSizes, { defaultSizes } from "./sizes";
import { Dimensions } from "react-native";

const defaultDimensions = {
  width: 285,
  scale: 1,
  fontScale: 1,
  height: 549,
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
      xsmall: 16,
      small: 18,
      medium: 21,
      large: 31,
      xlarge: 42,
      xxlarge: 62,
    },
    lineHeights: {
      xsmall: 21,
      small: 26,
      medium: 31,
      large: 42,
      xlarge: 62,
      xxlarge: 83,
    },
    spacing: {
      small: 11,
      xsmall: 6,
      medium: 22,
      large: 34,
      xlarge: 45,
      xxlarge: 67,
      xxxlarge: 90,
    },
  });
});

it("SHOULD return the scaled size FOR desktop", () => {
  dimensionsGetSpy.mockReturnValue({
    ...defaultDimensions,
    width: 1024,
  });

  const sizes = getScaledSizes();

  expect(sizes).toEqual({
    borderRadius: {
      small: 6,
      medium: 12,
      large: 24,
      xlarge: 48,
      full: "50%",
    },
    fontSizes: {
      xsmall: 19,
      small: 22,
      medium: 26,
      large: 38,
      xlarge: 51,
      xxlarge: 77,
    },
    lineHeights: {
      xsmall: 26,
      small: 32,
      medium: 38,
      large: 51,
      xlarge: 77,
      xxlarge: 102,
    },
    spacing: {
      xsmall: 7,
      small: 14,
      medium: 29,
      large: 43,
      xlarge: 58,
      xxlarge: 86,
      xxxlarge: 115,
    },
  });
});
