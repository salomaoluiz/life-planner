import { router, usePathname } from "expo-router";

import { render } from "@tests";

import FinancialLayout from "../index";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 0, left: 0, right: 0, top: 0 })),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  Stack: Object.assign(
    jest.fn(() => null),
    { Screen: jest.fn(() => null) },
  ),
  usePathname: jest.fn(),
}));

export const spies = {
  replace: router.replace as jest.Mock,
  usePathname: usePathname as jest.Mock,
};

export function setup(pathname = "/financial") {
  spies.replace.mockClear();
  spies.usePathname.mockReturnValue(pathname);

  return render(<FinancialLayout />);
}
