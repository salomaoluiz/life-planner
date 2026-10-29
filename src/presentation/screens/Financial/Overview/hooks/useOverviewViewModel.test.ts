import { act } from "@tests";

import { consumePendingNavigation } from "@screens/Financial/Transactions/hooks/pendingNavigation";
import { setTransactionFilters } from "@screens/Financial/Transactions/hooks/useTransactionFilters";
import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";

import {
  given,
  queries,
  queryProps,
  setup,
  spies,
  useCases,
} from "./mocks/useOverviewViewModel.mocks";

jest.mock(
  "@screens/Financial/Transactions/hooks/useTransactionFilters",
  () => ({
    __esModule: true,
    setTransactionFilters: jest.fn(),
  }),
);

const summary = {
  balance: { current: 1000, previous: 500, projectedEnd: null },
  currencies: [
    { accounts: 1, cards: 0, code: "BRL" },
    { accounts: 3, cards: 1, code: "USD" },
  ],
  currency: "BRL",
  expense: { previous: 0, projected: 0, realized: 0 },
  income: { previous: 0, projected: 0, realized: 0 },
};

describe("defaults", () => {
  it("SHOULD open on 1M, all scopes AND the default granularity of the period", () => {
    const { result } = setup();

    expect(result.current.preset).toBe("1M");
    expect(result.current.period).toEqual({
      from: "2026-10-01",
      to: "2026-11-30",
    });
    expect(result.current.effectiveGranularity).toBe("WEEK");
    expect(result.current.ownerFilter).toBe("ALL");
    expect(result.current.type).toBe("EXPENSE");
    // "All" leaves the archived family out.
    expect(result.current.ownerIds).toEqual(["user-id", "family-1"]);
  });

  it("SHOULD query every block with the period, owners AND currency", async () => {
    setup();
    jest
      .mocked(useCases.getFinancialDashboardSummaryUseCase.execute)
      .mockResolvedValue(summary as never);

    await queryProps("summary").fetch();

    expect(
      useCases.getFinancialDashboardSummaryUseCase.execute,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: "BRL",
        from: "2026-10-01",
        ownerIds: ["user-id", "family-1"],
        to: "2026-11-30",
      }),
    );
    await queryProps("CATEGORY").fetch();
    expect(useCases.getFinancialTotalsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: "CATEGORY", type: "EXPENSE" }),
    );
  });
});

describe("controls", () => {
  it("SHOULD change the preset AND open the custom sheet for Custom", () => {
    const { result } = setup();

    act(() => result.current.onPresetChange("3M"));
    expect(result.current.period.from).toBe("2026-08-01");
    act(() => result.current.onPresetChange("CUSTOM"));
    expect(result.current.customOpen).toBe(true);
    act(() =>
      result.current.onApplyCustomPeriod({
        from: "2026-01-01",
        to: "2026-03-31",
      }),
    );
    expect(result.current.preset).toBe("CUSTOM");
    expect(result.current.period).toEqual({
      from: "2026-01-01",
      to: "2026-03-31",
    });
    expect(result.current.customOpen).toBe(false);
  });

  it("SHOULD pick the currency with most accounts until the user chooses one", () => {
    given("summary", summary);
    const { result } = setup();

    expect(result.current.currency).toBe("USD");
    act(() => result.current.onCurrencyChange("BRL"));
    expect(result.current.currency).toBe("BRL");
  });

  it("SHOULD narrow the queries to one scope", () => {
    const { result } = setup();

    act(() => result.current.onOwnerFilterChange("family-1"));
    expect(result.current.ownerIds).toEqual(["family-1"]);
    act(() => result.current.onOwnerFilterChange("gone"));
    expect(result.current.ownerFilter).toBe("ALL");
  });

  it("SHOULD drop a granularity the period does not allow", () => {
    const { result } = setup();

    act(() => result.current.onPresetChange("12M"));
    act(() => result.current.onGranularityChange("DAY"));
    expect(result.current.effectiveGranularity).toBe("MONTH");
    act(() => result.current.onPresetChange("1M"));
    expect(result.current.effectiveGranularity).toBe("DAY");
  });
});

describe("blocks", () => {
  it("SHOULD flag an empty period only when every bucket is zero", () => {
    given("PERIOD", {
      bucket: "MONTH",
      groupBy: "PERIOD",
      items: [
        {
          end: "x",
          expense: { projected: 0, realized: 0 },
          income: { projected: 0, realized: 0 },
          start: "y",
        },
      ],
    });
    queries.PERIOD.value.status = "success";
    given("PERIOD", queries.PERIOD.value.data);

    expect(setup().result.current.noTransactions).toBe(true);
  });

  it("SHOULD refetch the blocks when the screen gains focus again", () => {
    spies.isFocused.mockReturnValue(true);
    const { rerender } = setup();

    expect(queries.summary.value.refetch).not.toHaveBeenCalled();
    spies.isFocused.mockReturnValue(false);
    rerender({});
    spies.isFocused.mockReturnValue(true);
    rerender({});
    expect(queries.summary.value.refetch).toHaveBeenCalledTimes(1);
    expect(queries.CATEGORY.value.refetch).toHaveBeenCalledTimes(1);
  });
});

describe("categories and drill-through", () => {
  const share = { percent: "30%", value: 300 };

  it("SHOULD open the subcategories of a parent AND go back", () => {
    const { result } = setup();

    act(() =>
      result.current.onCategoryPress("housing", "Housing", true, share),
    );
    expect(result.current.parent).toEqual({
      id: "housing",
      name: "Housing",
      ...share,
    });
    act(() => result.current.onBack());
    expect(result.current.parent).toBeUndefined();
  });

  it("SHOULD open Transactions filtered by a leaf category with the period, scope AND type", () => {
    const { result } = setup();

    act(() => result.current.onTypeChange("INCOME"));
    act(() => result.current.onOwnerFilterChange("family-1"));
    act(() => result.current.onCategoryPress("food", "Food", false, share));

    expect(setTransactionFilters).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      categoryIds: ["food"],
      period: { from: "2026-10-01", to: "2026-11-30" },
    });
    expect(consumePendingNavigation()).toEqual({
      scope: "family-1",
      type: "INCOME",
    });
    expect(spies.push).toHaveBeenCalledWith("/financial");
  });

  it("SHOULD open the parent in Transactions from its subcategories AND open a tag", () => {
    const { result } = setup();

    act(() =>
      result.current.onCategoryPress("housing", "Housing", true, share),
    );
    act(() => result.current.onOpenParentTransactions());
    expect(setTransactionFilters).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryIds: ["housing"] }),
    );
    act(() => result.current.onTagPress("fixed"));
    expect(setTransactionFilters).toHaveBeenLastCalledWith(
      expect.objectContaining({ tagIds: ["fixed"] }),
    );
  });

  it("SHOULD open the new transaction form from the empty state", () => {
    const { result } = setup();

    act(() => result.current.onNewTransaction());
    expect(spies.push).toHaveBeenCalledWith(
      "/financial/transaction/add_new_transaction",
    );
  });
});
