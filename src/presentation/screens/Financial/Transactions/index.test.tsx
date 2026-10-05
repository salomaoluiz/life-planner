import { GenericError } from "@domain/entities/errors";
import FinancialTransactionViewModel from "@screens/Financial/Transactions/models/FinancialTransactionViewModel";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/screen.mocks";

it("SHOULD render the loading title WHEN fetching", () => {
  setup({ isFetching: true });

  expect(hasText("Loading...")).toBe(true);
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
});

it("SHOULD render the error message WHEN the query failed", () => {
  setup({ error: true });

  expect(hasText(`Error ${new GenericError().message}`)).toBe(true);
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
});

it("SHOULD render one list item per transaction", () => {
  setup({ items: mocks.items });

  const rows = screen.getAllByTestId("listItem");
  expect(rows).toHaveLength(2);
  expect(rows[0].props.title).toBe("Later");
});

it("SHOULD render an empty list WHEN there is no data", () => {
  setup();

  expect(screen.getByTestId("flashList")).toBeOnTheScreen();
  expect(screen.queryAllByTestId("listItem")).toHaveLength(0);
});

it("SHOULD pass refetch to every list item", () => {
  const { refetch } = setup({ items: mocks.items });

  fireEvent.press(screen.getAllByTestId("listItem")[0]);

  expect(refetch).toHaveBeenCalled();
});

it("SHOULD set the refresh button as header WHEN not fetching", () => {
  const { refetch } = setup();

  expect(mocks.setOptions).toHaveBeenCalledTimes(1);
  const { headerRight } = mocks.setOptions.mock.calls[0][0];
  expect(headerRight().props.refetchQuery).toBe(refetch);
});

it("SHOULD NOT set the header WHEN fetching", () => {
  setup({ isFetching: true });

  expect(mocks.setOptions).not.toHaveBeenCalled();
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

it("SHOULD build view models sorted by date ascending WHEN fetching", async () => {
  setup();
  const { cacheKey, fetch } = spies.useQuery.mock.calls[0][0];
  spies.getOwners.mockResolvedValue(mocks.owners);
  spies.getTransactions.mockResolvedValue(mocks.dtos);

  const result = (await fetch()) as FinancialTransactionViewModel[];

  expect(cacheKey).toEqual(["get_transactions"]);
  expect(spies.getTransactions).toHaveBeenCalledWith({
    ownerIds: ["owner-1", "owner-2"],
  });
  expect(result.map((vm) => vm.description)).toEqual(["Earlier", "Later"]);
});
