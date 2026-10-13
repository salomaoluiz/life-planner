import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { listElement, onRefresh, setup } from "./mocks/index.mocks";

function root() {
  return StyleSheet.flatten(screen.getByTestId("screen").props.style);
}

it("SHOULD fill with the background color and render children with lg gap", () => {
  setup();
  expect(screen.getByText("child")).toBeTruthy();
  expect(root().backgroundColor).toBe(lightTheme.colors.background);
});

it("SHOULD use lg horizontal padding at 390 px", () => {
  setup();
  expect(root().paddingHorizontal).toBe(lightTheme.sizes.spacing.lg);
});

it("SHOULD center content at max 720 px from 768 px up", () => {
  setup({}, 1280);
  expect(root().paddingHorizontal).toBe(280);
});

it("SHOULD center the column in its own measured width (next to the 240 px rail) instead of the window width", () => {
  setup({}, 1280);
  fireEvent(screen.getByTestId("screen"), "layout", {
    nativeEvent: { layout: { height: 800, width: 1040, x: 0, y: 0 } },
  });
  expect(root().paddingHorizontal).toBe(160);
});

it("SHOULD center content at `maxWidth` WHEN given (Home uses 960)", () => {
  setup({ maxWidth: 960 }, 1280);
  expect(root().paddingHorizontal).toBe(160);
});

it("SHOULD scroll with keyboard handling WHEN scroll", () => {
  setup({ scroll: true });
  const scroll = screen.getByTestId("screen-scroll");
  expect(scroll.props.keyboardShouldPersistTaps).toBe("handled");
});

it("SHOULD expose pull to refresh WHEN onRefresh is given in scroll mode", () => {
  setup({ onRefresh, refreshing: false, scroll: true });
  const scroll = screen.getByTestId("screen-scroll");
  expect(scroll.props.refreshControl.props.onRefresh).toBe(onRefresh);
});

it("SHOULD render the caller's list with the children as header WHEN list", () => {
  setup({ list: listElement() });
  expect(screen.getByText("child")).toBeTruthy();
  expect(screen.getByText("row")).toBeTruthy();
});
