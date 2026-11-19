import { fireEvent, render, screen } from "@tests";

import ShoppingListSummaryUIModel from "@screens/Home/models/ShoppingListSummaryUIModel";
import homeTestIds from "@screens/Home/testIds";

import StockShoppingListCard from "./";

const summary = new ShoppingListSummaryUIModel(
  {
    count: 7,
    groups: [
      {
        list: { id: "m", name: "Mercado", owner: "FAMILY", ownerName: "Casa" },
        rows: [{ description: "Milk", quantity: 6, unit: "unit" as never }],
      },
    ],
    totals: [{ currency: "BRL", estimatedTotalCents: 9420, pricedCount: 6 }],
  },
  "en-US",
);

function renderCard(state: Record<string, unknown>) {
  const onSeeAllPress = jest.fn();

  render(
    <StockShoppingListCard
      onSeeAllPress={onSeeAllPress}
      state={state as never}
    />,
  );

  return onSeeAllPress;
}

it("SHOULD list what the stock asked for with the total and open the lists", () => {
  const onSeeAll = renderCard({
    data: summary,
    isError: false,
    isLoading: false,
    onRetry: jest.fn(),
  });

  expect(screen.getByTestId(homeTestIds.shoppingListCard)).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${homeTestIds.shoppingListTotal}-BRL`),
  ).toBeOnTheScreen();
  expect(screen.getByText("Mercado · Casa")).toBeOnTheScreen();
  expect(screen.getAllByTestId(homeTestIds.shoppingListRow)).toHaveLength(1);

  fireEvent.press(screen.getByTestId(homeTestIds.shoppingListSeeAll));
  expect(onSeeAll).toHaveBeenCalled();
  expect(
    screen.getByText('home.stock.shoppingListSeeAll {"count":6}'),
  ).toBeOnTheScreen();
});

it("SHOULD offer plain See lists WHEN every row is shown", () => {
  renderCard({
    data: new ShoppingListSummaryUIModel(
      {
        count: 1,
        groups: summary.groups.length
          ? [
              {
                list: { id: "m", name: "Mercado", owner: "USER" },
                rows: [
                  { description: "Milk", quantity: 1, unit: "unit" as never },
                ],
              },
            ]
          : [],
        totals: [],
      },
      "en-US",
    ),
    isError: false,
    isLoading: false,
    onRetry: jest.fn(),
  });

  expect(screen.getByText("home.stock.shoppingListSeeLists")).toBeOnTheScreen();
});

it("SHOULD render nothing WHEN no row was asked for, and the loading and error blocks otherwise", () => {
  const { toJSON } = render(
    <StockShoppingListCard
      onSeeAllPress={jest.fn()}
      state={{
        data: new ShoppingListSummaryUIModel(
          { count: 0, groups: [], totals: [] },
          "en-US",
        ),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(toJSON()).toBeNull();
  screen.unmount();

  renderCard({ isError: false, isLoading: true, onRetry: jest.fn() });
  expect(screen.getByTestId(homeTestIds.shoppingListLoading)).toBeOnTheScreen();
  screen.unmount();

  const retry = jest.fn();

  renderCard({ isError: true, isLoading: false, onRetry: retry });
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(retry).toHaveBeenCalled();
});
