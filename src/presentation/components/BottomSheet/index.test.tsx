import { AccessibilityInfo, Modal, StyleSheet, Text } from "react-native";

import { act, fireEvent, screen, waitFor } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { onClose, setup } from "./mocks/index.mocks";

it("SHOULD render nothing WHEN not visible", () => {
  setup({ visible: false });
  expect(screen.queryByTestId("sheet")).toBeNull();
});

it("SHOULD render the subtitle under the title WHEN given", () => {
  setup({ subtitle: "Silva family" });
  expect(screen.getByTestId("sheet-subtitle").props.children).toBe(
    "Silva family",
  );
});

it("SHOULD not render a subtitle by default", () => {
  setup();
  expect(screen.queryByTestId("sheet-subtitle")).toBeNull();
});

it("SHOULD render title, body and a header close button", () => {
  setup();
  expect(screen.getByTestId("sheet-title").props.children).toBe("New item");
  expect(screen.getByText("body")).toBeTruthy();
  expect(screen.getByTestId("sheet-close").props.accessibilityLabel).toBe(
    "Close",
  );
});

it("SHOULD close via the close button, backdrop and Android back exactly once each", () => {
  setup();
  fireEvent.press(screen.getByTestId("sheet-close"));
  fireEvent.press(screen.getByTestId("sheet-backdrop"));
  act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
  expect(onClose).toHaveBeenCalledTimes(3);
});

it("SHOULD close on a swipe down on the grabber but not on a short drag", () => {
  setup();
  const grabber = screen.getByTestId("sheet-grabber", {
    includeHiddenElements: true,
  });
  function touchEvent(y: number) {
    const touch = {
      currentPageX: 0,
      currentPageY: y,
      currentTimeStamp: 1,
      previousPageX: 0,
      previousPageY: 0,
      previousTimeStamp: 1,
      startPageX: 0,
      startPageY: 0,
      startTimeStamp: 1,
      touchActive: true,
    };
    return {
      nativeEvent: {},
      touchHistory: {
        indexOfSingleActiveTouch: 0,
        mostRecentTimeStamp: 1,
        numberActiveTouches: 1,
        touchBank: [touch],
      },
    };
  }
  function move(dy: number) {
    grabber.props.onResponderGrant(touchEvent(0));
    grabber.props.onResponderMove(touchEvent(dy));
    grabber.props.onResponderRelease(touchEvent(dy));
  }
  move(20);
  expect(onClose).not.toHaveBeenCalled();
  move(120);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("SHOULD render the sticky footer WHEN given", () => {
  setup({ footer: <Text>footer</Text> });
  expect(screen.getByTestId("sheet-footer")).toBeTruthy();
  expect(screen.getByText("footer")).toBeTruthy();
});

it("SHOULD not render a footer area WHEN none is given", () => {
  setup();
  expect(screen.queryByTestId("sheet-footer")).toBeNull();
});

it("SHOULD use top radius sheet and surface on compact, capped at 90% height", () => {
  setup();
  const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
  expect(style.backgroundColor).toBe(lightTheme.colors.surface);
  expect(style.borderTopLeftRadius).toBe(lightTheme.sizes.borderRadius.sheet);
  expect(style.maxHeight).toBe("90%");
});

it.each(["medium", "expanded"] as const)(
  "SHOULD be a centered 480 px dialog on %s",
  (breakpoint) => {
    setup({}, breakpoint);
    const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
    expect(style.maxWidth).toBe(480);
    expect(style.borderRadius).toBe(lightTheme.sizes.borderRadius.lg);
  },
);

it("SHOULD render without a Modal WHEN inline", () => {
  setup({ presentation: "inline" });
  expect(screen.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
  expect(screen.getByTestId("sheet")).toBeTruthy();
});

it("SHOULD respect reduce motion by not animating", async () => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
  setup();
  await waitFor(() => expect(screen.getByTestId("sheet")).toBeTruthy());
});
