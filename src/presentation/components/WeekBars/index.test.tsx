import { render, screen } from "@testing-library/react-native";

import WeekBars from "./index";

const bars = [
  { excluded: false, key: "a", ratio: 1, weight: 0.4 },
  { excluded: true, key: "b", ratio: 0, weight: 0.7 },
];

it("SHOULD expose the figures to a screen reader AND draw one bar per week", () => {
  render(<WeekBars accessibilityLabel="4, 0" bars={bars} testID="chart" />);

  expect(screen.getByLabelText("4, 0")).toBeOnTheScreen();
  expect(screen.getByTestId("chart-a")).toBeOnTheScreen();
  expect(screen.getByTestId("chart-b")).toBeOnTheScreen();
});

it("SHOULD keep a minimum height for a week at zero AND grey it out", () => {
  render(<WeekBars accessibilityLabel="x" bars={bars} testID="chart" />);

  const flat = screen.getByTestId("chart-b").props.style;
  const style = Array.isArray(flat) ? Object.assign({}, ...flat) : flat;

  expect(style.height).toBe(4);
  expect(style.opacity).toBe(1);
});
