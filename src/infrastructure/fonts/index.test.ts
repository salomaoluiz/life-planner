import * as expoFont from "expo-font";

import { renderHook } from "@tests";

import * as monitoring from "@infrastructure/monitoring";

import { useAppFonts } from "./index";

jest.mock("expo-font");
jest.mock("@expo-google-fonts/manrope", () => ({
  Manrope_500Medium: 1,
  Manrope_600SemiBold: 2,
  Manrope_700Bold: 3,
  Manrope_800ExtraBold: 4,
}));

const useFontsSpy = jest.spyOn(expoFont, "useFonts");
const captureExceptionSpy = jest
  .spyOn(monitoring, "captureException")
  .mockImplementation();

beforeEach(() => jest.clearAllMocks());

it("SHOULD register the four Manrope weights", () => {
  useFontsSpy.mockReturnValue([false, null]);
  renderHook(useAppFonts);

  expect(useFontsSpy).toHaveBeenCalledWith({
    Manrope_500Medium: 1,
    Manrope_600SemiBold: 2,
    Manrope_700Bold: 3,
    Manrope_800ExtraBold: 4,
  });
});

it("SHOULD report not ready while loading", () => {
  useFontsSpy.mockReturnValue([false, null]);

  expect(renderHook(useAppFonts).result.current).toEqual({
    failed: false,
    ready: false,
  });
});

it("SHOULD be ready WHEN loaded", () => {
  useFontsSpy.mockReturnValue([true, null]);

  expect(renderHook(useAppFonts).result.current).toEqual({
    failed: false,
    ready: true,
  });
  expect(captureExceptionSpy).not.toHaveBeenCalled();
});

it("SHOULD be ready AND failed, reporting once, WHEN loading fails", () => {
  const error = new Error("font failed");
  useFontsSpy.mockReturnValue([false, error]);

  const { rerender, result } = renderHook(useAppFonts);
  rerender({});

  expect(result.current).toEqual({ failed: true, ready: true });
  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith(error, {
    action: "Using the system font",
  });
});
