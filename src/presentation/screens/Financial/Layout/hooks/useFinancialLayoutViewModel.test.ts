import { usePathname } from "expo-router";
import { useWindowDimensions } from "react-native";

import { renderHook } from "@tests";

import useFinancialLayoutViewModel from "./useFinancialLayoutViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  usePathname: jest.fn(),
}));
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

function run(path: string, breakpoint: string, width: number) {
  jest.mocked(usePathname).mockReturnValue(path);
  jest
    .requireMock("@presentation/theme")
    .useBreakpoint.mockReturnValue(breakpoint);
  jest.mocked(useWindowDimensions).mockReturnValue({
    fontScale: 1,
    height: 900,
    scale: 1,
    width,
  });

  return renderHook(() => useFinancialLayoutViewModel()).result.current;
}

it("SHOULD widen only the Overview on the expanded breakpoint", () => {
  expect(run("/financial/overview", "expanded", 1920).maxWidth).toBe(1344);
  expect(
    run("/financial/categories", "expanded", 1920).maxWidth,
  ).toBeUndefined();
  expect(run("/financial/overview", "medium", 900).maxWidth).toBeUndefined();
  expect(run("/financial/overview", "compact", 390).maxWidth).toBeUndefined();
});
