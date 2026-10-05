import { StyleSheet } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { manyOptions, onChange, setup } from "./mocks/index.mocks";

it("SHOULD show label and the selected option label with a chevron", () => {
  setup();
  expect(screen.getByTestId("select-label").props.children).toBe("Unit");
  expect(screen.getByTestId("select-value").props.children).toBe("Kilogram");
  expect(screen.getByTestId("select-chevron")).toBeTruthy();
});

it("SHOULD show the placeholder WHEN value is not among the options or empty", () => {
  setup({ value: "stale" });
  expect(screen.getByTestId("select-value").props.children).toBe("Choose");
});

it("SHOULD show the placeholder WHEN there is no value", () => {
  setup({ value: undefined });
  expect(screen.getByTestId("select-value").props.children).toBe("Choose");
});

it("SHOULD open a sheet with every option and mark the selected one", () => {
  setup();
  expect(screen.queryByTestId("select-sheet")).toBeNull();
  fireEvent.press(screen.getByTestId("select"));
  expect(screen.getByTestId("select-option-kg")).toBeTruthy();
  expect(screen.getByTestId("select-option-g")).toBeTruthy();
  expect(
    screen.getByTestId("select-option-kg").props.accessibilityState.selected,
  ).toBe(true);
  expect(
    screen.getByTestId("select-option-g").props.accessibilityState.selected,
  ).toBe(false);
  expect(screen.getByTestId("select-option-kg-title")).toBeTruthy();
});

it("SHOULD call onChange and close the sheet when an option is tapped", () => {
  setup();
  fireEvent.press(screen.getByTestId("select"));
  fireEvent.press(screen.getByTestId("select-option-g"));
  expect(onChange).toHaveBeenCalledWith("g");
  expect(screen.queryByTestId("select-sheet")).toBeNull();
});

it("SHOULD close the sheet from its close button without changing the value", () => {
  setup();
  fireEvent.press(screen.getByTestId("select"));
  fireEvent.press(screen.getByTestId("select-sheet-close"));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.queryByTestId("select-sheet")).toBeNull();
});

it("SHOULD show search only WHEN there are more than 8 options and filter by label", () => {
  setup({ options: manyOptions(8) });
  fireEvent.press(screen.getByTestId("select"));
  expect(screen.queryByTestId("select-search")).toBeNull();
});

it("SHOULD filter options case-insensitively WHEN there are 9 options", () => {
  setup({
    options: manyOptions(9),
    searchClearLabel: "Clear",
    searchPlaceholder: "Search",
    value: undefined,
  });
  fireEvent.press(screen.getByTestId("select"));
  fireEvent.changeText(screen.getByTestId("select-search"), "option 3");
  expect(screen.getByTestId("select-option-o3")).toBeTruthy();
  expect(screen.queryByTestId("select-option-o4")).toBeNull();
});

it("SHOULD render an empty sheet WHEN there are no options without crashing", () => {
  setup({ options: [], value: undefined });
  fireEvent.press(screen.getByTestId("select"));
  expect(screen.getByTestId("select-sheet")).toBeTruthy();
});

it("SHOULD show the error with red border and not open WHEN disabled", () => {
  setup({ disabled: true, error: "Required" });
  expect(screen.getByTestId("select-error").props.children).toBe("Required");
  expect(
    StyleSheet.flatten(screen.getByTestId("select").props.style).borderColor,
  ).toBe(lightTheme.colors.expense);
  fireEvent.press(screen.getByTestId("select"));
  expect(screen.queryByTestId("select-sheet")).toBeNull();
});
