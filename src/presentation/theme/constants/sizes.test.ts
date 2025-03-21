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

  expect(sizes).toEqual({ ...defaultSizes, noScaled: defaultSizes });
});

it("SHOULD return the scaled size FOR tablet", () => {
  dimensionsGetSpy.mockReturnValue({
    ...defaultDimensions,
    width: 600,
  });

  const sizes = getScaledSizes();

  expect(sizes).toEqual({
    borderRadius: {
      full: "50%",
      large: 19,
      medium: 10,
      small: 5,
      xlarge: 38,
    },
    fontSizes: {
      large: 29,
      medium: 19,
      small: 17,
      xlarge: 38,
      xsmall: 14,
      xxlarge: 58,
      xxsmall: 12,
    },
    lineHeights: {
      large: 38,
      medium: 29,
      small: 24,
      xlarge: 58,
      xsmall: 19,
      xxlarge: 77,
      xxsmall: 17,
    },
    noScaled: defaultSizes,
    spacing: {
      large: 29,
      medium: 19,
      small: 14,
      xlarge: 38,
      xsmall: 10,
      xxlarge: 58,
      xxsmall: 5,
      xxxlarge: 77,
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
      large: 21,
      medium: 10,
      small: 5,
      xlarge: 42,
    },
    fontSizes: {
      large: 31,
      medium: 21,
      small: 18,
      xlarge: 42,
      xsmall: 16,
      xxlarge: 62,
      xxsmall: 13,
    },
    lineHeights: {
      large: 42,
      medium: 31,
      small: 26,
      xlarge: 62,
      xsmall: 21,
      xxlarge: 83,
      xxsmall: 18,
    },
    noScaled: defaultSizes,
    spacing: {
      large: 31,
      medium: 21,
      small: 16,
      xlarge: 42,
      xsmall: 10,
      xxlarge: 62,
      xxsmall: 5,
      xxxlarge: 83,
    },
  });
});
