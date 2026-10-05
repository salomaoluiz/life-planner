import { ALL_FILTER, PERSONAL_FILTER } from "../models/ownerFilter";
import {
  act,
  loaded,
  mocks,
  optionsOf,
  queries,
  setup,
  spies,
} from "./mocks/useHomeViewModel.mocks";

it("SHOULD key every block query by the owner ids and the month, and wait for the owners", () => {
  setup();

  expect(optionsOf("summary").enabled).toBe(false);
  expect(optionsOf("stock").enabled).toBe(false);
  expect(optionsOf("transactions").enabled).toBe(false);
});

it("SHOULD enable the block queries once the owners are loaded", () => {
  setup(loaded);

  expect(optionsOf("summary").enabled).toBe(true);
  expect(optionsOf("summary").cacheKey).toEqual([
    "summary",
    "family-1,user-id",
    "2026-10",
  ]);
});

describe("owner filter", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 10, 0));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("SHOULD offer All, Personal and the families", () => {
    const { result } = setup(loaded);

    expect(result.current.filter.options.map((o) => o.value)).toEqual([
      ALL_FILTER,
      PERSONAL_FILTER,
      "family-1",
    ]);
    expect(result.current.filter.value).toBe(ALL_FILTER);
  });

  it("SHOULD query only the personal owner WHEN Personal is chosen", async () => {
    const { result } = setup(loaded);

    act(() => result.current.filter.onChange(PERSONAL_FILTER));

    await optionsOf("summary").fetch();
    expect(spies.getMonthSummary).toHaveBeenCalledWith({
      month: expect.any(Date),
      ownerIds: ["user-id"],
    });
    await optionsOf("stock").fetch();
    expect(spies.getStockAttention).toHaveBeenCalledWith({
      ownerIds: ["user-id"],
    });
    await optionsOf("transactions").fetch();
    expect(spies.getRecentTransactions).toHaveBeenCalledWith({
      ownerIds: ["user-id"],
    });
  });

  it("SHOULD query only that family WHEN a family is chosen", async () => {
    const { result } = setup(loaded);

    act(() => result.current.filter.onChange("family-1"));
    await optionsOf("stock").fetch();

    expect(spies.getStockAttention).toHaveBeenCalledWith({
      ownerIds: ["family-1"],
    });
  });

  it("SHOULD fall back to All WHEN the stored selection is not an owner anymore", async () => {
    const { result: store } = setup(loaded);
    act(() => store.current.filter.onChange("left-family"));

    expect(store.current.filter.value).toBe(ALL_FILTER);
    await optionsOf("stock").fetch();
    expect(spies.getStockAttention).toHaveBeenLastCalledWith({
      ownerIds: ["family-1", "user-id"],
    });
  });
});

describe("block states", () => {
  it("SHOULD be loading while there is no data and no error", () => {
    const { result } = setup();

    expect(result.current.summary).toMatchObject({
      isError: false,
      isLoading: true,
    });
  });

  it("SHOULD map the data to UI models", () => {
    const { result } = setup(loaded);

    expect(result.current.summary.data?.income).toBe(150);
    expect(result.current.stock.data?.isNothingExpiring).toBe(true);
    expect(result.current.transactions.data?.[0].title).toBe("Market");
    expect(result.current.header.avatarName).toBe("Ana Souza");
  });

  it("SHOULD fail only the stock block WHEN the stock query fails", () => {
    queries.stock.withError();
    const { result } = setup({
      owners: mocks.owners,
      summary: mocks.summary,
      transactions: mocks.transactions,
    });

    expect(result.current.stock.isError).toBe(true);
    expect(result.current.summary.isError).toBe(false);
    expect(result.current.transactions.isError).toBe(false);
  });

  it("SHOULD retry only the failed query", () => {
    queries.stock.withError();
    const { result } = setup({ owners: mocks.owners });

    result.current.stock.onRetry();

    expect(queries.stock.value.refetch).toHaveBeenCalledTimes(1);
    expect(queries.summary.value.refetch).not.toHaveBeenCalled();
  });

  it("SHOULD keep showing the data WHEN a background refetch fails", () => {
    queries.summary.withError();
    const { result } = setup({ owners: mocks.owners, summary: mocks.summary });

    expect(result.current.summary.isError).toBe(false);
    expect(result.current.summary.data?.income).toBe(150);
  });

  it("SHOULD show retry on every block WHEN the owners query fails", () => {
    queries.owners.withError();
    const { result } = setup();

    expect(result.current.summary.isError).toBe(true);
    expect(result.current.stock.isError).toBe(true);
    expect(result.current.transactions.isError).toBe(true);

    result.current.stock.onRetry();
    expect(queries.owners.value.refetch).toHaveBeenCalledTimes(1);
  });
});

describe("refresh", () => {
  it("SHOULD refetch every query on pull to refresh AND toggle isRefreshing", async () => {
    const { result } = setup(loaded);

    await act(async () => {
      await result.current.onRefresh();
    });

    Object.values(queries).forEach((query) =>
      expect(query.value.refetch).toHaveBeenCalledTimes(1),
    );
    expect(result.current.isRefreshing).toBe(false);
  });

  it("SHOULD refetch WHEN the screen is focused", () => {
    spies.isFocused.mockReturnValue(true);
    setup(loaded);

    expect(queries.stock.value.refetch).toHaveBeenCalled();
  });

  it("SHOULD NOT refetch WHEN the screen is not focused", () => {
    setup(loaded);

    expect(queries.stock.value.refetch).not.toHaveBeenCalled();
  });
});

describe("navigation", () => {
  it("SHOULD open Finances from the summary, the transactions link and the rows", () => {
    const { result } = setup(loaded);

    result.current.onSummaryPress();
    result.current.onTransactionsSeeAllPress();

    expect(spies.push).toHaveBeenNthCalledWith(1, "/financial");
    expect(spies.push).toHaveBeenNthCalledWith(2, "/financial");
  });

  it("SHOULD open Stock with the Expiring filter from the stock link", () => {
    const { result } = setup(loaded);

    result.current.onStockSeeAllPress();

    expect(spies.push).toHaveBeenCalledWith({
      params: { filter: "EXPIRING" },
      pathname: "/stock",
    });
  });

  it("SHOULD open the add forms", () => {
    const { result } = setup(loaded);

    result.current.onAddStockItemPress();
    result.current.onAddTransactionPress();

    expect(spies.push).toHaveBeenNthCalledWith(1, "/stock/add_new_stock_item");
    expect(spies.push).toHaveBeenNthCalledWith(
      2,
      "/financial/transaction/add_new_transaction",
    );
  });
});

describe("layout", () => {
  it.each([
    ["compact", false],
    ["medium", false],
    ["expanded", true],
  ])(
    "SHOULD use the split layout only on expanded (%s)",
    (breakpoint, expected) => {
      spies.useBreakpoint.mockReturnValue(breakpoint as never);

      expect(setup(loaded).result.current.isSplitLayout).toBe(expected);
    },
  );
});
