import StockViewModel from "@screens/Stock/models/StockViewModel";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render the loading title WHEN fetching", () => {
  setup({ isFetching: true });

  expect(hasText("Loading...")).toBe(true);
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
});

it("SHOULD render one card per stock item", () => {
  setup({ items: mocks.items });

  expect(screen.getAllByTestId("stockCard")).toHaveLength(2);
  expect(screen.getAllByTestId("stockCard")[0].props.title).toBe("Rice");
  expect(screen.getAllByTestId("stockCard")[1].props.title).toBe("Milk");
});

it("SHOULD render an empty list WHEN there is no data", () => {
  setup();

  expect(screen.getByTestId("flashList")).toBeOnTheScreen();
  expect(screen.queryAllByTestId("stockCard")).toHaveLength(0);
});

it("SHOULD pass refetch to every card", () => {
  const { refetch } = setup({ items: mocks.items });

  fireEvent.press(screen.getAllByTestId("stockCard")[0]);

  expect(refetch).toHaveBeenCalled();
});

it("SHOULD refetch WHEN the screen is focused", () => {
  const { refetch } = setup({ focused: true });

  expect(refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT refetch WHEN the screen is not focused", () => {
  const { refetch } = setup({ focused: false });

  expect(refetch).not.toHaveBeenCalled();
});

it("SHOULD NOT render an add button (adding lives in the quick-add tab button)", () => {
  setup();

  expect(screen.UNSAFE_queryAllByProps({ icon: "plus" })).toHaveLength(0);
});

it.each([
  [true, 2],
  [false, 1],
])("SHOULD use numColumns for isWeb=%s", (isWeb, columns) => {
  spies.isWeb.mockReturnValue(isWeb);
  setup();

  expect(screen.getByTestId("flashList").props.numColumns).toBe(columns);
});

it("SHOULD build view models from owners and stock items WHEN fetching", async () => {
  setup();
  const { cacheKey, fetch } = spies.useQuery.mock.calls[0][0];
  spies.getOwners.mockResolvedValue(mocks.owners);
  spies.getStockItems.mockResolvedValue(mocks.stockDTOs);

  const result = (await fetch()) as StockViewModel[];

  expect(cacheKey).toEqual(["get_stock"]);
  expect(spies.getStockItems).toHaveBeenCalledWith({
    ownerIds: ["owner-1", "owner-2"],
  });
  expect(result.map((vm) => vm.description)).toEqual(["Rice", "Milk"]);
  expect(result[1].owner).toBe("Test Family (Family)");
});
