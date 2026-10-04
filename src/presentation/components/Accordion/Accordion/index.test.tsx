import { Text } from "react-native";

import { mockDarkTheme } from "@tests";

import { mocks, screen, setup, toggle } from "./mocks/index.mocks";

it("SHOULD render the header and the left element but hide the content WHEN collapsed", () => {
  setup();

  expect(screen.getByTestId("accordion-header")).toBeOnTheScreen();
  expect(screen.getByTestId("accordion-left")).toBeOnTheScreen();
  expect(screen.queryByTestId("accordion-content")).not.toBeOnTheScreen();
});

it("SHOULD report the collapsed status on mount", () => {
  setup();

  expect(mocks.defaultProps.getAccordionStatus).toHaveBeenCalledWith(false);
});

it("SHOULD show the content and call the callbacks WHEN pressed", () => {
  setup();

  toggle();

  expect(screen.getByTestId("accordion-content")).toBeOnTheScreen();
  expect(mocks.defaultProps.onPress).toHaveBeenCalledTimes(1);
  expect(mocks.defaultProps.getAccordionStatus).toHaveBeenLastCalledWith(true);
});

it("SHOULD hide the content again WHEN pressed twice", () => {
  setup();

  toggle();
  toggle();

  expect(screen.queryByTestId("accordion-content")).not.toBeOnTheScreen();
  expect(mocks.defaultProps.getAccordionStatus).toHaveBeenLastCalledWith(false);
});

it("SHOULD work WHEN the optional callbacks are not provided", () => {
  setup({
    getAccordionStatus: undefined,
    onLongPress: undefined,
    onPress: undefined,
  });

  toggle();

  expect(screen.getByTestId("accordion-content")).toBeOnTheScreen();
});

it("SHOULD render the default chevron WHEN there is no right element", () => {
  setup();

  expect(screen.getByTestId("accordion-chevron-down")).toBeOnTheScreen();
});

it("SHOULD render the custom right element instead of the chevron WHEN provided", () => {
  setup({ right: <Text testID="accordion-right">Right</Text> });

  expect(screen.getByTestId("accordion-right")).toBeOnTheScreen();
  expect(screen.queryByTestId("accordion-chevron-down")).not.toBeOnTheScreen();
});

it("SHOULD forward long press to the accordion", () => {
  setup();

  screen.UNSAFE_getByProps({ id: "accordion-1" }).props.onLongPress();

  expect(mocks.defaultProps.onLongPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render in the dark theme", () => {
  const restore = mockDarkTheme();

  setup();

  expect(screen.getByTestId("accordion-header")).toBeOnTheScreen();
  restore();
});
