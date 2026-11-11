import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import InvestmentsSummaryUIModel from "../models/InvestmentsSummaryUIModel";
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
  expect(optionsOf("upcoming").enabled).toBe(false);
  expect(optionsOf("balances").enabled).toBe(false);
  expect(optionsOf("accounts").enabled).toBe(false);
});

it("SHOULD enable the block queries once the owners are loaded", () => {
  setup(loaded);

  expect(optionsOf("summary").enabled).toBe(true);
  expect(optionsOf("summary").cacheKey).toEqual([
    ...financeKeys.summary.ofMonth("2026-10", "home"),
    "family-1,user-id",
    "BRL",
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
      currency: "BRL",
      month: expect.any(Date),
      ownerIds: ["user-id"],
    });
    await optionsOf("stock").fetch();
    expect(spies.getStockAttention).toHaveBeenCalledWith({
      ownerIds: ["user-id"],
    });
    await optionsOf("upcoming").fetch();
    expect(spies.getUpcoming).toHaveBeenCalledWith({ ownerIds: ["user-id"] });
    await optionsOf("accounts").fetch();
    expect(spies.getAccounts).toHaveBeenCalledWith(["user-id"]);
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

    expect(result.current.balance).toMatchObject({
      isError: false,
      isLoading: true,
    });
    expect(result.current.upcoming.isLoading).toBe(true);
  });

  it("SHOULD map the data to UI models", () => {
    const { result } = setup(loaded);

    expect(result.current.balance.data?.income).toBe(150);
    expect(result.current.balance.data?.projectedValue).toBe(80000);
    expect(result.current.lowest.data?.tiles).toHaveLength(2);
    expect(result.current.stock.data?.isNothingExpiring).toBe(true);
    expect(result.current.upcoming.data?.overdue.rows[0].id).toBe("t1");
    expect(result.current.header.avatarName).toBe("Ana Souza");
  });

  it("SHOULD put the favorite account on the balance AND the lowest balance blocks (spec 094)", () => {
    const favorite = new AccountDTO({
      ...mocks.accounts[0],
      isFavorite: true,
    });
    const { result } = setup({ ...loaded, accounts: [favorite] });

    expect(result.current.balance.data?.favoriteName).toBe("Checking");
    expect(result.current.lowest.data?.favoriteName).toBe("Checking");
  });

  it("SHOULD ignore a favorite that is archived (spec 094)", () => {
    const archived = new AccountDTO({
      ...mocks.accounts[0],
      isFavorite: true,
      status: "ARCHIVED",
    });
    const { result } = setup({ ...loaded, accounts: [archived] });

    expect(result.current.balance.data?.favoriteName).toBeUndefined();
    expect(result.current.lowest.data?.favoriteName).toBeUndefined();
  });

  it("SHOULD fail only the stock block WHEN the stock query fails", () => {
    queries.stock.withError();
    const { result } = setup({
      accounts: mocks.accounts,
      balances: mocks.balances,
      owners: mocks.owners,
      summary: mocks.summary,
      upcoming: mocks.upcoming,
    });

    expect(result.current.stock.isError).toBe(true);
    expect(result.current.balance.isError).toBe(false);
    expect(result.current.lowest.isError).toBe(false);
    expect(result.current.upcoming.isError).toBe(false);
  });

  it("SHOULD retry only the failed query", () => {
    queries.stock.withError();
    const { result } = setup({ owners: mocks.owners });

    result.current.stock.onRetry();

    expect(queries.stock.value.refetch).toHaveBeenCalledTimes(1);
    expect(queries.summary.value.refetch).not.toHaveBeenCalled();
  });

  it("SHOULD keep showing the data WHEN a background refetch fails", () => {
    queries.upcoming.withError();
    const { result } = setup({
      owners: mocks.owners,
      upcoming: mocks.upcoming,
    });

    expect(result.current.upcoming.isError).toBe(false);
    expect(result.current.upcoming.data?.isEmpty).toBe(false);
  });

  it("SHOULD fail only the upcoming block WHEN the upcoming query fails", () => {
    queries.upcoming.withError();
    const { result } = setup({
      accounts: mocks.accounts,
      balances: mocks.balances,
      owners: mocks.owners,
      stock: mocks.stock,
      summary: mocks.summary,
    });

    expect(result.current.upcoming.isError).toBe(true);
    expect(result.current.balance.isError).toBe(false);
    expect(result.current.lowest.isError).toBe(false);
    expect(result.current.stock.isError).toBe(false);
  });

  it("SHOULD retry every query of a block that needs several", () => {
    queries.summary.withError();
    const { result } = setup({ owners: mocks.owners });

    result.current.balance.onRetry();

    expect(queries.summary.value.refetch).toHaveBeenCalledTimes(1);
    expect(queries.balances.value.refetch).toHaveBeenCalled();
    expect(queries.accounts.value.refetch).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show retry on every block WHEN the owners query fails", () => {
    queries.owners.withError();
    const { result } = setup();

    expect(result.current.balance.isError).toBe(true);
    expect(result.current.lowest.isError).toBe(true);
    expect(result.current.stock.isError).toBe(true);
    expect(result.current.upcoming.isError).toBe(true);

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

    Object.entries(queries).forEach(([name, query]) =>
      // This month's and next month's balances share one fixture here.
      expect(query.value.refetch).toHaveBeenCalledTimes(
        name === "balances" ? 2 : 1,
      ),
    );
    expect(result.current.isRefreshing).toBe(false);
  });

  it("SHOULD refetch only the stale queries WHEN the screen is focused AND leave the profile alone", () => {
    spies.isFocused.mockReturnValue(true);
    setup(loaded);

    expect(spies.refetchStale).toHaveBeenCalledWith([
      ["owners"],
      financeKeys.summary.all(),
      ["investment", "home-summary"],
      ["stock"],
      financeKeys.accounts.all(),
      financeKeys.dailyBalances.all(),
      financeKeys.upcoming.all(),
    ]);
    expect(queries.stock.value.refetch).not.toHaveBeenCalled();
    expect(queries.user.value.refetch).not.toHaveBeenCalled();
  });

  it("SHOULD NOT refetch WHEN the screen is not focused", () => {
    setup(loaded);

    expect(spies.refetchStale).not.toHaveBeenCalled();
  });

  it("SHOULD keep the profile fresh for good (it changes only through the user's own edits)", () => {
    setup(loaded);

    expect(spies.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ cacheKey: ["user"], staleTime: Infinity }),
    );
  });
});

describe("navigation", () => {
  it("SHOULD open the Overview and the transactions screen", () => {
    const { result } = setup(loaded);

    result.current.onOverviewPress();
    result.current.onUpcomingSeeAllPress();

    expect(spies.push).toHaveBeenNthCalledWith(1, "/financial/overview");
    expect(spies.push).toHaveBeenNthCalledWith(2, "/financial/transaction");
  });

  it("SHOULD open the transaction modal from a transaction row", () => {
    const { result } = setup(loaded);

    result.current.onUpcomingItemPress(mocks.upcoming.overdue[0]);

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "add_new_transaction",
      { id: "t1" },
    );
  });

  it("SHOULD open a projection the way the transactions screen does", () => {
    const { result } = setup(loaded);

    result.current.onUpcomingItemPress({
      ...mocks.upcoming.overdue[0],
      date: "2026-12-05",
      kind: "PROJECTION",
      occurrenceNumber: 4,
      recurrenceId: "rec-1",
    });

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "add_new_transaction",
      { month: "2026-12", occurrenceNumber: "4", recurrenceId: "rec-1" },
    );
  });

  it("SHOULD open the transactions screen filtered by the card and the invoice month", () => {
    const { result } = setup(loaded);

    result.current.onInvoicePress({
      ...mocks.upcoming.overdue[0],
      creditCardId: "card-1",
      date: "2026-11-15",
      kind: "INVOICE",
    });

    expect(spies.setTransactionFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        cardIds: ["card-1"],
        origin: "CARD",
        period: { from: "2026-11-01", to: "2026-11-30" },
      }),
    );
    expect(spies.push).toHaveBeenCalledWith("/financial/transaction");
  });

  it("SHOULD open the new account form", () => {
    const { result } = setup(loaded);

    result.current.onCreateAccountPress();

    expect(modalNavigation.openModal).toHaveBeenCalledWith("add_new_account");
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

    expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
      1,
      "add_new_stock_item",
    );
    expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
      2,
      "add_new_transaction",
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

describe("currency (spec 103)", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 10, 0));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("SHOULD hide the dropdown WHEN every account is in BRL", () => {
    const { result } = setup(loaded);

    expect(result.current.currency).toMatchObject({
      options: ["BRL"],
      value: "BRL",
      visible: false,
    });
  });

  it("SHOULD show the dropdown WHEN there is an active USD account AND read the summary and balances in the chosen currency", async () => {
    const usd = new AccountDTO({
      balance: 1250,
      currency: "USD",
      icon: "bank",
      id: "account-usd",
      name: "Abroad",
      owner: "USER",
      ownerId: "user-id",
      status: "ACTIVE",
    });
    const { result } = setup({
      ...loaded,
      accounts: [...mocks.accounts, usd],
    });

    expect(result.current.currency.visible).toBe(true);
    expect(result.current.currency.options).toEqual(["BRL", "USD"]);

    act(() => result.current.currency.onChange("USD"));

    expect(optionsOf("summary").cacheKey.at(-1)).toBe("USD");
    await optionsOf("summary").fetch();
    expect(spies.getMonthSummary).toHaveBeenLastCalledWith(
      expect.objectContaining({ currency: "USD" }),
    );
  });
});

describe("investments section (spec 109)", () => {
  it("SHOULD read the summary of the selected owners with the local date", async () => {
    const { result } = setup(loaded);

    await optionsOf("investment").fetch();
    expect(spies.getInvestments).toHaveBeenLastCalledWith({
      ownerIds: ["family-1", "user-id"],
      today: "2026-10-15",
    });

    act(() => result.current.filter.onChange(PERSONAL_FILTER));
    await optionsOf("investment").fetch();
    expect(spies.getInvestments).toHaveBeenLastCalledWith({
      ownerIds: ["user-id"],
      today: "2026-10-15",
    });
  });

  it("SHOULD map the summary to its UI model, loading until it arrives", () => {
    const { result } = setup({ ...loaded, investment: undefined });

    expect(result.current.investments.isLoading).toBe(true);

    queries.investment.withData(mocks.investment);
    const { result: ready } = setup(loaded);

    expect(ready.current.investments.data).toBeInstanceOf(
      InvestmentsSummaryUIModel,
    );
  });

  it("SHOULD fail only its own block WHEN the summary query fails", () => {
    queries.investment.withError();
    const { result } = setup({
      accounts: mocks.accounts,
      balances: mocks.balances,
      owners: mocks.owners,
      stock: mocks.stock,
      summary: mocks.summary,
      upcoming: mocks.upcoming,
    });

    expect(result.current.investments.isError).toBe(true);
    expect(result.current.stock.isError).toBe(false);
    expect(result.current.balance.isError).toBe(false);

    result.current.investments.onRetry();
    expect(queries.investment.value.refetch).toHaveBeenCalledTimes(1);
    expect(queries.stock.value.refetch).not.toHaveBeenCalled();
  });

  it("SHOULD open the module, the suggestions inbox, an asset and the asset form", () => {
    const { result } = setup(loaded);

    result.current.onInvestmentsPress();
    result.current.onInvestmentsSuggestionsPress();
    result.current.onInvestmentsMaturityPress("asset-1");
    result.current.onInvestmentsAddAssetPress();

    expect(spies.push).toHaveBeenNthCalledWith(1, "/investments");
    expect(spies.push).toHaveBeenNthCalledWith(2, "/investments/suggestions");
    expect(spies.push).toHaveBeenNthCalledWith(3, "/investments/asset/asset-1");
    expect(modalNavigation.openModal).toHaveBeenCalledWith("investment_asset");
  });

  it("SHOULD offer Add asset except for an archived family", () => {
    const archived = new OwnerDTO({
      archived: true,
      id: "family-old",
      name: "Old",
      type: OwnerType.FAMILY,
    });
    const { result } = setup({ ...loaded, owners: [archived, mocks.person] });

    expect(result.current.canAddInvestmentAsset).toBe(true);

    act(() => result.current.filter.onChange("family-old"));

    expect(result.current.canAddInvestmentAsset).toBe(false);
  });
});
