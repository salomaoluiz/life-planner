import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render the totals WHEN the dashboard is loaded", () => {
  setup();

  expect(hasText("Stock Dashboard")).toBe(true);
  expect(hasText("Total items: 1")).toBe(true);
  expect(hasText("Expired items: 1")).toBe(true);
  expect(screen.queryByTestId("skeleton")).not.toBeOnTheScreen();
});

it.each([
  ["fetching", { isFetching: true }],
  ["there is no data", { loaded: false }],
])("SHOULD render the skeleton WHEN %s", (_, props) => {
  setup(props);

  expect(screen.getByTestId("skeleton").props.width).toBe(0);
  expect(hasText("Stock Dashboard")).toBe(false);
});

it("SHOULD size the skeleton to the measured layout width", () => {
  setup({ loaded: false });

  fireEvent(screen.getByTestId("skeleton").parent!, "layout", {
    nativeEvent: { layout: { width: 320 } },
  });

  expect(screen.getByTestId("skeleton").props.width).toBe(320);
});

it("SHOULD refetch WHEN the screen is focused", () => {
  const { refetch } = setup({ focused: true });

  expect(refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT refetch WHEN the screen is not focused", () => {
  const { refetch } = setup({ focused: false });

  expect(refetch).not.toHaveBeenCalled();
});

it("SHOULD build the view model from the dashboard use case WHEN fetching", async () => {
  setup();
  const { cacheKey, fetch } = spies.useQuery.mock.calls[0][0];
  spies.getDashboard.mockResolvedValue(mocks.dashboardDTO);

  const result = (await fetch()) as { itemQuantity: number };

  expect(cacheKey).toEqual(["dashboard"]);
  expect(result.itemQuantity).toBe(1);
});
