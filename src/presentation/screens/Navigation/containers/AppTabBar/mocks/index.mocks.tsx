import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";

import { render } from "@tests";

import AppTabBar from "../";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 0, left: 0, right: 0, top: 0 })),
}));

// region mocks
const emit = jest.fn(() => ({ defaultPrevented: false }));
const dispatch = jest.fn();

function buildProps(activeIndex = 0): BottomTabBarProps {
  const routes = [
    { key: "index-key", name: "index/index" },
    { key: "financial-key", name: "financial" },
    { key: "stock-key", name: "stock/index" },
    { key: "family-key", name: "family/index" },
  ];

  return {
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
    navigation: { dispatch, emit },
    state: { index: activeIndex, key: "tabs-key", routes },
  } as unknown as BottomTabBarProps;
}
// endregion mocks

function setBreakpoint(value: "compact" | "expanded" | "medium") {
  jest.requireMock("@presentation/theme").useBreakpoint.mockReturnValue(value);
}

beforeEach(() => {
  jest.clearAllMocks();
  emit.mockReturnValue({ defaultPrevented: false });
  setBreakpoint("compact");
});

function setup(activeIndex = 0) {
  render(<AppTabBar {...buildProps(activeIndex)} />);
}

const spies = { dispatch, emit, push: jest.mocked(router.push) };

export { setBreakpoint, setup, spies };
