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
  .mockReturnValueOnce(defaultDimensions);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD return the regular size FOR mobile", () => {
  const sizes = getScaledSizes();

  expect(sizes).toEqual(defaultSizes);
});

it("SHOULD return the scaled size FOR tablet", () => {
  dimensionsGetSpy.mockReturnValueOnce({
    ...defaultDimensions,
    width: 600,
  });

  const sizes = getScaledSizes();

  expect(sizes).toEqual({
    borderRadius: {
      full: "50%",
      large: 18,
      medium: 9,
      small: 5,
      xlarge: 37,
    },
    fontSizes: {
      large: 28,
      medium: 18,
      small: 16,
      xlarge: 37,
      xsmall: 14,
      xxlarge: 55,
      xxsmall: 12,
    },
    lineHeights: {
      large: 37,
      medium: 28,
      small: 23,
      xlarge: 55,
      xsmall: 18,
      xxlarge: 74,
      xxsmall: 16,
    },
    spacing: {
      large: 28,
      medium: 18,
      small: 14,
      xlarge: 37,
      xsmall: 9,
      xxlarge: 55,
      xxsmall: 5,
      xxxlarge: 74,
    },
  });
});

it("SHOULD return the scaled size FOR desktop", () => {
  dimensionsGetSpy.mockReturnValueOnce({
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
