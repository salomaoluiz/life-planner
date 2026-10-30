import { router, usePathname } from "expo-router";

import { render } from "@tests";

import FinancialLayout from "../index";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 0, left: 0, right: 0, top: 0 })),
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Stack: Object.assign(
    jest.fn(() => null),
    { Screen: jest.fn(() => null) },
  ),
  usePathname: jest.fn(),
}));

export const spies = {
  push: router.push as jest.Mock,
  replace: router.replace as jest.Mock,
  usePathname: usePathname as jest.Mock,
};

export function setup(
  pathname = "/financial/transaction",
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  spies.push.mockClear();
  spies.replace.mockClear();
  spies.usePathname.mockReturnValue(pathname);
  setBreakpoint(breakpoint);

  return render(<FinancialLayout />);
}

function setBreakpoint(value: "compact" | "expanded" | "medium") {
  jest.requireMock("@presentation/theme").useBreakpoint.mockReturnValue(value);
}
