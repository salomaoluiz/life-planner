import { fireEvent, render, screen } from "@tests";

import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import MonthSummaryUIModel from "@screens/Home/models/MonthSummaryUIModel";

import MonthSummaryCard from "./";

function model(balance: number) {
  return new MonthSummaryUIModel(
    new MonthSummaryDTO({ balance, expense: 36160, income: 650000 }),
    new Date(2026, 9, 15),
    "en-US",
  );
}

const onPress = jest.fn();

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the skeleton WHILE loading", () => {
  render(
    <MonthSummaryCard
      onPress={onPress}
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(screen.getByTestId("home-summary-loading")).toBeOnTheScreen();
});

it("SHOULD render the error with a retry that refetches only this block", () => {
  const onRetry = jest.fn();
  render(
    <MonthSummaryCard
      onPress={onPress}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the month title, balance, income and expenses", () => {
  render(
    <MonthSummaryCard
      onPress={onPress}
      state={{
        data: model(613840),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(screen.getByText(/home.summary.title.*October/)).toBeOnTheScreen();
  expect(screen.getByTestId("home-summary-balance")).toBeOnTheScreen();
  expect(screen.getByText("home.summary.income")).toBeOnTheScreen();
  expect(screen.getByText("home.summary.expenses")).toBeOnTheScreen();
});

it("SHOULD be pressable (opens Finances)", () => {
  render(
    <MonthSummaryCard
      onPress={onPress}
      state={{
        data: model(613840),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  fireEvent.press(screen.getByTestId("home-summary"));

  expect(onPress).toHaveBeenCalledTimes(1);
});
