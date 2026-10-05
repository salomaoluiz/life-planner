import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { onCancel, onConfirm, setup } from "./mocks/index.mocks";

it("SHOULD render title and message", () => {
  setup();
  expect(screen.getByTestId("dialog-title").props.children).toBe(
    "Delete Milk?",
  );
  expect(screen.getByTestId("dialog-message").props.children).toBe(
    "This cannot be undone.",
  );
});

it("SHOULD confirm with a destructive button and cancel with a secondary one", () => {
  setup();
  const confirm = screen.getByTestId("dialog-confirm");
  const cancel = screen.getByTestId("dialog-cancel");
  expect(StyleSheet.flatten(confirm.props.style).backgroundColor).toBe(
    lightTheme.colors.expenseSoft,
  );
  expect(StyleSheet.flatten(cancel.props.style).backgroundColor).toBe(
    lightTheme.colors.surfaceRaised,
  );
  fireEvent.press(confirm);
  fireEvent.press(cancel);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD call onCancel from the sheet close button", () => {
  setup();
  fireEvent.press(screen.getByTestId("dialog-close"));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD not allow a second confirm WHEN loading", () => {
  setup({ loading: true });
  fireEvent.press(screen.getByTestId("dialog-confirm"));
  expect(onConfirm).not.toHaveBeenCalled();
  expect(
    screen.getByTestId("dialog-confirm").props.accessibilityState.busy,
  ).toBe(true);
});

it("SHOULD render nothing WHEN not visible", () => {
  setup({ visible: false });
  expect(screen.queryByTestId("dialog-title")).toBeNull();
});
