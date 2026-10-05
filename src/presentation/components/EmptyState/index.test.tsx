import { StyleSheet } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { EmptyState } from "@components";
import { lightTheme } from "@presentation/theme/provider";

const onAction = jest.fn();

beforeEach(() => jest.clearAllMocks());

it("SHOULD render a dashed card with icon, title and message", () => {
  render(
    <EmptyState
      message="Add the first one"
      testID="empty"
      title="Nothing here"
    />,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("empty").props.style).borderStyle,
  ).toBe("dashed");
  expect(screen.getByTestId("empty-title").props.children).toBe("Nothing here");
  expect(screen.getByTestId("empty-message").props.children).toBe(
    "Add the first one",
  );
  expect(screen.getByTestId("empty-tile-icon")).toBeTruthy();
});

it("SHOULD not render the action WHEN there is none", () => {
  render(<EmptyState message="m" testID="empty" title="t" />);
  expect(screen.queryByTestId("empty-action")).toBeNull();
});

it("SHOULD render a primary action and call it", () => {
  render(
    <EmptyState
      actionLabel="Add"
      message="m"
      onAction={onAction}
      testID="empty"
      title="t"
    />,
  );
  fireEvent.press(screen.getByTestId("empty-action"));
  expect(onAction).toHaveBeenCalledTimes(1);
});

it("SHOULD use the accent tile by default", () => {
  render(<EmptyState message="m" testID="empty" title="t" />);
  expect(screen.getByTestId("empty-tile-icon").props.color).toBe(
    lightTheme.colors.accentText,
  );
});

it("SHOULD use the expense tile WHEN tone is expense", () => {
  render(
    <EmptyState message="m" testID="empty-expense" title="t" tone="expense" />,
  );
  expect(screen.getByTestId("empty-expense-tile-icon").props.color).toBe(
    lightTheme.colors.expense,
  );
});
