import { render, screen } from "@tests";

import StockAttentionDTO from "@application/dto/home/StockAttentionDTO";
import StockAttentionUIModel from "@screens/Home/models/StockAttentionUIModel";
import homeTestIds from "@screens/Home/testIds";

import StockSummaryCard from "./";

function model(attentionCount: number, totalItems: number) {
  return new StockAttentionUIModel(
    new StockAttentionDTO({ attentionCount, items: [], totalItems }),
    [],
  );
}

it("SHOULD render the skeleton WHILE loading", () => {
  render(
    <StockSummaryCard
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(
    screen.getByTestId(homeTestIds.stockAttentionLoading),
  ).toBeOnTheScreen();
});

it("SHOULD render the error with a retry", () => {
  render(
    <StockSummaryCard
      state={{ isError: true, isLoading: false, onRetry: jest.fn() }}
    />,
  );

  expect(screen.getByTestId(homeTestIds.stockAttentionError)).toBeOnTheScreen();
});

it("SHOULD show how many items need attention and how many are in stock", () => {
  render(
    <StockSummaryCard
      state={{
        data: model(4, 12),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(screen.getByTestId(homeTestIds.stockAttentionCount)).toHaveTextContent(
    'home.stock.count_other {"count":4}',
  );
  expect(screen.getByText('home.stock.inStock {"count":12}')).toBeOnTheScreen();
});

it("SHOULD use the singular key WHEN one item needs attention", () => {
  render(
    <StockSummaryCard
      state={{
        data: model(1, 1),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(screen.getByTestId(homeTestIds.stockAttentionCount)).toHaveTextContent(
    'home.stock.count_one {"count":1}',
  );
});
