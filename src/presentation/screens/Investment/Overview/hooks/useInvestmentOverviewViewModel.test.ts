import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import {
  dashboard,
  dashboardQuery,
  given,
  queries,
  setup,
  spies,
  useCases,
} from "./mocks/useInvestmentOverviewViewModel.mocks";

describe("defaults", () => {
  it("SHOULD open on 12M ending today, all active owners, with nothing ahead", () => {
    const { result } = setup();

    expect(result.current.preset).toBe("12M");
    expect(result.current.period).toEqual({
      from: "2025-12-01",
      to: "2026-11-04",
    });
    expect(result.current.today).toBe("2026-11-04");
    expect(result.current.ownerFilter).toBe("ALL");
    expect(result.current.ownerIds).toEqual(["user-id", "family-1"]);
    expect(result.current.canGoNext).toBe(false);
    expect(result.current.showToday).toBe(false);
  });

  it("SHOULD ask the dashboard with the owners, the period AND the local date", async () => {
    setup();

    await dashboardQuery().fetch();

    expect(
      useCases.getInvestmentsDashboardUseCase.execute,
    ).toHaveBeenCalledWith({
      from: "2025-12-01",
      ownerIds: ["user-id", "family-1"],
      to: "2026-11-04",
      today: "2026-11-04",
    });
  });

  it("SHOULD wait for the owners before asking", () => {
    queries.owners.reset();
    setup();

    expect(dashboardQuery().enabled).toBe(false);
  });
});

describe("period", () => {
  it("SHOULD change the preset AND open the custom sheet for Custom", () => {
    const { result } = setup();

    act(() => result.current.onPresetChange("3M"));
    expect(result.current.period).toEqual({
      from: "2026-09-01",
      to: "2026-11-04",
    });

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

  it("SHOULD open the custom sheet on the default range the first time", () => {
    const { result } = setup();

    act(() => result.current.onPresetChange("CUSTOM"));

    expect(result.current.customInitial).toEqual({
      from: "2025-01-01",
      to: "2026-11-04",
    });
  });

  it("SHOULD step back by the preset, allow the way forward ONLY from the past AND go back to today", () => {
    const { result } = setup();

    act(() => result.current.onPreviousPeriod());
    expect(result.current.period).toEqual({
      from: "2024-12-01",
      to: "2025-11-30",
    });
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.showToday).toBe(true);

    act(() => result.current.onNextPeriod());
    expect(result.current.period.to).toBe("2026-11-04");
    expect(result.current.canGoNext).toBe(false);

    act(() => result.current.onNextPeriod());
    expect(result.current.period.to).toBe("2026-11-04");

    act(() => result.current.onPreviousPeriod());
    act(() => result.current.onBackToToday());
    expect(result.current.period.to).toBe("2026-11-04");
    expect(result.current.showToday).toBe(false);
  });

  it("SHOULD move a custom range by itself AND never past today", () => {
    const { result } = setup();

    act(() => result.current.onPresetChange("CUSTOM"));
    act(() =>
      result.current.onApplyCustomPeriod({
        from: "2026-01-01",
        to: "2026-06-30",
      }),
    );
    act(() => result.current.onNextPeriod());

    expect(result.current.period).toEqual({
      from: "2026-07-01",
      to: "2026-11-04",
    });
    expect(result.current.canGoNext).toBe(false);
  });
});

describe("owners", () => {
  it("SHOULD ask only the chosen owner AND share the choice", () => {
    const { result } = setup();

    act(() => result.current.onOwnerFilterChange("family-2"));

    expect(result.current.ownerIds).toEqual(["family-2"]);
    expect(setup().result.current.ownerFilter).toBe("family-2");
  });

  it("SHOULD fall back to all owners WHEN the chosen one disappeared", () => {
    const { result } = setup();

    act(() => result.current.onOwnerFilterChange("gone"));

    expect(result.current.ownerFilter).toBe("ALL");
  });
});

describe("class filter AND ranking", () => {
  it("SHOULD toggle the class AND clear it WHEN the period or the owner changes", () => {
    const { result } = setup();

    act(() => result.current.onClassSelect(InvestmentAssetClass.BR_STOCK));
    expect(result.current.selectedClass).toBe(InvestmentAssetClass.BR_STOCK);

    act(() => result.current.onClassSelect(InvestmentAssetClass.BR_STOCK));
    expect(result.current.selectedClass).toBeUndefined();

    act(() => result.current.onClassSelect(InvestmentAssetClass.BR_STOCK));
    act(() => result.current.onPresetChange("6M"));
    expect(result.current.selectedClass).toBeUndefined();

    act(() => result.current.onClassSelect(InvestmentAssetClass.BR_STOCK));
    act(() => result.current.onOwnerFilterChange("user-id"));
    expect(result.current.selectedClass).toBeUndefined();
  });

  it("SHOULD expand the ranking in place AND collapse it with the class", () => {
    const { result } = setup();

    act(() => result.current.onSeeAll());
    expect(result.current.expanded).toBe(true);

    act(() => result.current.onClassSelect(InvestmentAssetClass.BR_STOCK));
    expect(result.current.expanded).toBe(false);
  });

  it("SHOULD open the asset detail", () => {
    const { result } = setup();

    result.current.onAssetPress("a1");

    expect(spies.push).toHaveBeenCalledWith("/investments/asset/a1");
  });
});

describe("chart selections", () => {
  it("SHOULD keep the chosen point AND income bucket until the period or the owner changes", () => {
    const { result } = setup();

    act(() => result.current.onPointSelect(3));
    act(() => result.current.onIncomeSelect(5));
    expect(result.current.selectedPoint).toBe(3);
    expect(result.current.selectedIncome).toBe(5);

    act(() => result.current.onPreviousPeriod());
    expect(result.current.selectedPoint).toBeUndefined();
    expect(result.current.selectedIncome).toBeUndefined();

    act(() => result.current.onIncomeSelect(1));
    act(() => result.current.onOwnerFilterChange("user-id"));
    expect(result.current.selectedIncome).toBeUndefined();
  });
});

describe("states", () => {
  it("SHOULD be empty WHEN no owner asset has an operation", () => {
    given(
      dashboard({
        ranking: [],
        series: [{ date: "2026-11-04", invested: null, marketValue: null }],
      }),
    );

    expect(setup().result.current.isEmpty).toBe(true);
  });

  it("SHOULD not be empty for a portfolio whose positions are all closed", () => {
    given(
      dashboard({
        ranking: [],
        series: [{ date: "2026-11-04", invested: 0, marketValue: 0 }],
      }),
    );

    expect(setup().result.current.isEmpty).toBe(false);
  });

  it("SHOULD not be empty WHILE loading", () => {
    queries.dashboard.reset();

    expect(setup().result.current.isEmpty).toBe(false);
  });

  it("SHOULD add an asset from the empty state AND show the read-only toast for an archived family", () => {
    const { result } = setup();

    act(() => result.current.onAddAsset());
    expect(modalNavigation.openModal).toHaveBeenCalledWith("investment_asset");

    act(() => result.current.onOwnerFilterChange("family-2"));
    modalNavigation.openModal.mockClear();
    act(() => result.current.onAddAsset());

    expect(modalNavigation.openModal).not.toHaveBeenCalled();
    expect(result.current.readOnlyScope.toastVisible).toBe(true);
  });
});
