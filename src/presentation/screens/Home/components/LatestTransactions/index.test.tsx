import { fireEvent, render, screen } from "@tests";

import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";
import RecentTransactionUIModel from "@screens/Home/models/RecentTransactionUIModel";

import LatestTransactions from "./";

const now = new Date(2026, 9, 5, 14, 0);

function row(id: string, description: string) {
  return new RecentTransactionUIModel(
    new RecentTransactionDTO({
      categoryName: "Groceries",
      date: new Date(2026, 9, 5, 9, 0).toISOString(),
      description,
      id,
      type: "EXPENSE",
      value: 1250,
    }),
    now,
    "en-US",
  );
}

const handlers = { onAddPress: jest.fn(), onSeeAllPress: jest.fn() };

function renderLoaded(data: RecentTransactionUIModel[]) {
  render(
    <LatestTransactions
      {...handlers}
      state={{ data, isError: false, isLoading: false, onRetry: jest.fn() }}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render three skeleton rows WHILE loading", () => {
  render(
    <LatestTransactions
      {...handlers}
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(screen.getAllByTestId("home-transactions-loading")).toHaveLength(3);
});

it("SHOULD render the error with a retry that refetches only this block", () => {
  const onRetry = jest.fn();
  render(
    <LatestTransactions
      {...handlers}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the rows with title, subtitle and amount", () => {
  renderLoaded([row("tx-1", "Market")]);

  expect(screen.getByText("Market")).toBeOnTheScreen();
  expect(
    screen.getByText(
      'home.transactions.subtitle {"category":"Groceries","date":"common.date.today"}',
    ),
  ).toBeOnTheScreen();
  expect(screen.getByTestId("home-transaction-tx-1")).toBeOnTheScreen();
});

it("SHOULD open the transactions WHEN pressing See all", () => {
  renderLoaded([row("tx-1", "Market")]);

  fireEvent.press(screen.getByText("common.actions.seeAll"));

  expect(handlers.onSeeAllPress).toHaveBeenCalledTimes(1);
});

it("SHOULD open the transactions WHEN pressing a row", () => {
  renderLoaded([row("tx-1", "Market")]);

  fireEvent.press(screen.getByTestId("home-transaction-tx-1"));

  expect(handlers.onSeeAllPress).toHaveBeenCalledTimes(1);
});

it("SHOULD offer to add a transaction WHEN there are none", () => {
  renderLoaded([]);

  fireEvent.press(screen.getByText("home.transactions.add"));

  expect(screen.getByText("home.transactions.emptyTitle")).toBeOnTheScreen();
  expect(handlers.onAddPress).toHaveBeenCalledTimes(1);
});
