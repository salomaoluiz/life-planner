import { useWindowDimensions } from "react-native";

import { renderHook } from "@tests";

jest.unmock("@presentation/theme");
jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  Object.defineProperty(actual, "useWindowDimensions", {
    configurable: true,
    value: jest.fn(),
  });

  return actual;
});

import { useBreakpoint } from "./useBreakpoint";

const dimensionsSpy = useWindowDimensions as jest.Mock;

function mockWidth(width: number) {
  dimensionsSpy.mockReturnValue({ fontScale: 1, height: 800, scale: 1, width });
}

it.each([
  [390, "compact"],
  [800, "medium"],
  [1280, "expanded"],
] as const)("SHOULD return the breakpoint for %spx", (width, expected) => {
  mockWidth(width);
  expect(renderHook(useBreakpoint).result.current).toBe(expected);
});

it("SHOULD update WHEN the window is resized", () => {
  mockWidth(390);
  const { rerender, result } = renderHook(useBreakpoint);
  expect(result.current).toBe("compact");

  mockWidth(1100);
  rerender({});

  expect(result.current).toBe("expanded");
});
