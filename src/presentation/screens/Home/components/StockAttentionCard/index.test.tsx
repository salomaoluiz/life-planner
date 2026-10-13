import { fireEvent, render, screen } from "@tests";

import StockAttentionDTO, {
  StockAttentionStatus,
} from "@application/dto/home/StockAttentionDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import StockAttentionUIModel from "@screens/Home/models/StockAttentionUIModel";

import StockAttentionCard from "./";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Silva", type: OwnerType.FAMILY }),
];

function model(totalItems: number, withRows = true) {
  const items = withRows
    ? [
        {
          daysLeft: -1,
          status: StockAttentionStatus.EXPIRED,
          stock: stock("s-1", "Milk"),
        },
        {
          daysLeft: 2,
          status: StockAttentionStatus.EXPIRING,
          stock: stock("s-2", "Cheese"),
        },
      ]
    : [];

  return new StockAttentionUIModel(
    new StockAttentionDTO({
      attentionCount: items.length,
      items,
      totalItems,
    }),
    owners,
  );
}

function stock(id: string, description: string) {
  return new StockDTO({
    description,
    id,
    owner: StockOwners.FAMILY,
    ownerId: "owner-1",
    quantity: 2,
    unit: StockUnits.UNIT,
  });
}

const handlers = { onAddItemPress: jest.fn(), onSeeAllPress: jest.fn() };

function renderLoaded(data: StockAttentionUIModel) {
  render(
    <StockAttentionCard
      {...handlers}
      state={{ data, isError: false, isLoading: false, onRetry: jest.fn() }}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the skeleton WHILE loading", () => {
  render(
    <StockAttentionCard
      {...handlers}
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(screen.getByTestId("home-stock-loading")).toBeOnTheScreen();
});

it("SHOULD render the error with a retry that refetches only this block", () => {
  const onRetry = jest.fn();
  render(
    <StockAttentionCard
      {...handlers}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the rows with title, subtitle and badge", () => {
  renderLoaded(model(5));

  expect(screen.getByText("Milk")).toBeOnTheScreen();
  expect(screen.getByText("Cheese")).toBeOnTheScreen();
  expect(screen.getAllByText(/home.stock.subtitle/)).toHaveLength(2);
  expect(screen.getByText("home.stock.expired")).toBeOnTheScreen();
  expect(
    screen.getByText('home.stock.expiresIn {"count":2}'),
  ).toBeOnTheScreen();
});

it("SHOULD show the item count under the title", () => {
  renderLoaded(model(5));

  expect(screen.getByTestId("home-stock-count")).toHaveTextContent(
    'home.stock.count {"count":5}',
  );
});

it("SHOULD open the stock WHEN pressing See all", () => {
  renderLoaded(model(5));

  fireEvent.press(screen.getByText("common.actions.seeAll"));

  expect(handlers.onSeeAllPress).toHaveBeenCalledTimes(1);
});

it("SHOULD open the stock WHEN pressing a row", () => {
  renderLoaded(model(5));

  fireEvent.press(screen.getByTestId("home-stock-row-s-1"));

  expect(handlers.onSeeAllPress).toHaveBeenCalledTimes(1);
});

it("SHOULD say nothing is expiring WHEN there are items but none need attention", () => {
  renderLoaded(model(5, false));

  expect(screen.getByText("home.stock.nothingExpiring")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-stock-row-s-1")).not.toBeOnTheScreen();
});

it("SHOULD offer to add an item WHEN the stock is empty", () => {
  renderLoaded(model(0, false));

  fireEvent.press(screen.getByText("home.stock.addItem"));

  expect(screen.getByText("home.stock.empty")).toBeOnTheScreen();
  expect(handlers.onAddItemPress).toHaveBeenCalledTimes(1);
});
