import { StyleSheet } from "react-native";

import { act, fireEvent, screen } from "@tests";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD render nothing when not visible", () => {
  setup({ visible: false });
  expect(screen.queryByTestId("toast")).toBeNull();
});

it("SHOULD show the message as a polite status", () => {
  setup();
  const toast = screen.getByTestId("toast");

  expect(screen.getByText("Transaction saved")).toBeTruthy();
  expect(toast.props.role).toBe("status");
  expect(toast.props.accessibilityLiveRegion).toBe("polite");
});

it("SHOULD call onHide after 3000ms by default", () => {
  setup();
  act(() => jest.advanceTimersByTime(2999));
  expect(spies.onHide).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1));
  expect(spies.onHide).toHaveBeenCalledTimes(1);
});

it("SHOULD honour durationMs", () => {
  setup({ durationMs: 500 });
  act(() => jest.advanceTimersByTime(500));
  expect(spies.onHide).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT call onHide after unmount", () => {
  setup();
  screen.unmount();
  act(() => jest.advanceTimersByTime(5000));
  expect(spies.onHide).not.toHaveBeenCalled();
});

it("SHOULD sit at the given bottom offset", () => {
  setup({ bottom: 176 });
  expect(
    StyleSheet.flatten(screen.getByTestId("toast-wrapper").props.style).bottom,
  ).toBe(176);
});

it("SHOULD NOT block touches outside its box", () => {
  setup();
  expect(screen.getByTestId("toast-wrapper").props.pointerEvents).toBe("none");
});

it("SHOULD show a custom icon WHEN one is given", () => {
  setup({ icon: "lock-outline" });

  expect(screen.getByText("Transaction saved")).toBeTruthy();
});

it("SHOULD render the action and call onAction when pressed", () => {
  const onAction = jest.fn();

  setup({ actionLabel: "Try again", actionTestID: "toast-action", onAction });
  expect(screen.getByText("Try again")).toBeTruthy();
  fireEvent.press(screen.getByTestId("toast-action"));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("toast-wrapper").props.pointerEvents).toBe(
    "box-none",
  );
});

it("SHOULD NOT render the action without onAction", () => {
  setup({ actionLabel: "Try again", actionTestID: "toast-action" });
  expect(screen.queryByTestId("toast-action")).toBeNull();
});
