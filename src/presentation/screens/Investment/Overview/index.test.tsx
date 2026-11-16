import { fireEvent, screen } from "@tests";

import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import * as theme from "@presentation/theme";

import {
  dashboard,
  handlers,
  query,
  ranking,
  setup,
} from "./mocks/index.mocks";
import overviewTestIds from "./testIds";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("expanded");
});

it("SHOULD render the five tiles with the sign AND the caption of the period", () => {
  setup();

  ["current-value", "invested", "open-result", "realized", "income"].forEach(
    (name) =>
      expect(screen.getByTestId(overviewTestIds.tile(name))).toBeOnTheScreen(),
  );
  expect(screen.getByText(/R\$\s?184[.,]320[.,]55/)).toBeOnTheScreen();
  expect(screen.getByText(/^\+R\$\s?21[.,]420[.,]55/)).toBeOnTheScreen();
  expect(screen.getByText(/^\+R\$\s?3[.,]180[.,]40/)).toBeOnTheScreen();
  expect(
    screen.getByText(/investment.overview.tile.incomePlanned/),
  ).toBeOnTheScreen();
});

it("SHOULD show the module AND the section in the header (no in-page tabs)", () => {
  setup();

  expect(screen.getByText("navigation.tabs.investments")).toBeOnTheScreen();
  expect(
    screen.getAllByText("investment.sections.overview").length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText("investment.sections.assets")).toBeNull();
});

it("SHOULD render the evolution, allocation, ranking AND income blocks", () => {
  setup();

  expect(screen.getByTestId(overviewTestIds.evolutionChart)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.allocationChart)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.incomeChart)).toBeOnTheScreen();
  expect(
    screen.getByTestId(overviewTestIds.rankingRow("asset-1")),
  ).toBeOnTheScreen();
});

describe("period", () => {
  it("SHOULD show the range AND disable the next arrow with the no-future hint", () => {
    setup({ canGoNext: false });

    expect(screen.getByTestId(overviewTestIds.periodRange)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(overviewTestIds.periodNext));
    expect(handlers.onNextPeriod).not.toHaveBeenCalled();
  });

  it("SHOULD move the period AND go back to today", () => {
    setup({ canGoNext: true, showToday: true });

    fireEvent.press(screen.getByTestId(overviewTestIds.periodPrevious));
    fireEvent.press(screen.getByTestId(overviewTestIds.periodNext));
    fireEvent.press(screen.getByTestId(overviewTestIds.periodToday));

    expect(handlers.onPreviousPeriod).toHaveBeenCalledTimes(1);
    expect(handlers.onNextPeriod).toHaveBeenCalledTimes(1);
    expect(handlers.onBackToToday).toHaveBeenCalledTimes(1);
  });

  it("SHOULD open the custom dialog with the investments testIDs", () => {
    setup({ customOpen: true });

    expect(
      screen.getByTestId("investment.overview.custom-apply"),
    ).toBeOnTheScreen();
  });
});

describe("allocation AND ranking", () => {
  it("SHOULD select a class from its legend row", () => {
    setup();

    fireEvent.press(
      screen.getByTestId(overviewTestIds.allocationClass("FOREIGN_STOCK")),
    );

    expect(handlers.onClassSelect).toHaveBeenCalledWith("FOREIGN_STOCK");
  });

  it("SHOULD show the dollar detail only for the selected foreign class", () => {
    setup();
    expect(screen.queryByTestId(overviewTestIds.usdDetail)).toBeNull();

    screen.unmount();
    setup({ selectedClass: InvestmentAssetClass.FOREIGN_STOCK });

    expect(screen.getByTestId(overviewTestIds.usdDetail)).toBeOnTheScreen();
  });

  it("SHOULD offer the filter chip to clear WHEN a class is selected", () => {
    setup({ selectedClass: InvestmentAssetClass.BR_STOCK });

    fireEvent.press(screen.getByTestId(overviewTestIds.rankingFilterClear));

    expect(handlers.onClassClear).toHaveBeenCalledTimes(1);
  });

  it("SHOULD open the asset of a ranking row", () => {
    setup();

    fireEvent.press(screen.getByTestId(overviewTestIds.rankingRow("asset-2")));

    expect(handlers.onAssetPress).toHaveBeenCalledWith("asset-2");
  });

  it("SHOULD offer to see all WHEN there are more than 10 rows", () => {
    setup({
      dashboard: query({
        ...dashboard,
        ranking: Array.from({ length: 12 }, (_, index) => ranking(index)),
      }),
    });

    expect(
      screen.queryByTestId(overviewTestIds.rankingRow("asset-11")),
    ).toBeNull();
    fireEvent.press(screen.getByTestId(overviewTestIds.rankingSeeAll));

    expect(handlers.onSeeAll).toHaveBeenCalledTimes(1);
  });
});

describe("details", () => {
  it("SHOULD show the values of the chosen point of the evolution", () => {
    setup({ selectedPoint: 2 });

    expect(
      screen.getByTestId(overviewTestIds.evolutionDetail),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the totals AND the types of the chosen income bucket", () => {
    setup({ selectedIncome: 0 });

    expect(screen.getByTestId(overviewTestIds.incomeDetail)).toBeOnTheScreen();
    expect(
      screen.getByText(/investment.income.types.JCP: 2/),
    ).toBeOnTheScreen();
  });

  it("SHOULD say where the position starts, never drawing a zero", () => {
    setup();

    expect(
      screen.getByText(/investment.overview.evolution.noPositionUntil/),
    ).toBeTruthy();
  });
});

describe("states", () => {
  it("SHOULD show the loading skeletons WHILE there is no answer", () => {
    setup({ dashboard: query() });

    expect(screen.getByTestId(overviewTestIds.screen)).toBeOnTheScreen();
    expect(
      screen.queryByTestId(overviewTestIds.rankingRow("asset-1")),
    ).toBeNull();
  });

  it("SHOULD show the empty state AND add an asset", () => {
    setup({ isEmpty: true });

    fireEvent.press(screen.getByText("investment.overview.emptyAdd"));

    expect(screen.getByTestId(overviewTestIds.empty)).toBeOnTheScreen();
    expect(handlers.onAddAsset).toHaveBeenCalled();
    expect(screen.queryByTestId(overviewTestIds.tile("invested"))).toBeNull();
  });

  it("SHOULD show the error with a retry", () => {
    setup({ dashboard: query(undefined, "error") });

    fireEvent.press(screen.getByText("investment.overview.retry"));

    expect(handlers.onRetry).toHaveBeenCalledTimes(1);
  });

  it("SHOULD warn about stale quotes AND assets counted at cost", () => {
    setup({
      dashboard: query({
        ...dashboard,
        summary: {
          ...dashboard.summary,
          assetsWithoutValue: 2,
          staleQuotes: 3,
        },
      }),
    });

    expect(screen.getByTestId(overviewTestIds.staleQuotes)).toBeOnTheScreen();
    expect(screen.getByTestId(overviewTestIds.withoutValue)).toBeOnTheScreen();
  });

  it("SHOULD not warn WHEN everything is fresh", () => {
    setup();

    expect(screen.queryByTestId(overviewTestIds.staleQuotes)).toBeNull();
    expect(screen.queryByTestId(overviewTestIds.withoutValue)).toBeNull();
  });

  it("SHOULD hide the add button WHEN the scope is read-only (archived family)", () => {
    setup({
      readOnlyScope: {
        guard: (action: () => void) => action,
        notifyReadOnly: jest.fn(),
        onToastHide: jest.fn(),
        readOnly: true,
        toastVisible: false,
      } as never,
    });

    expect(screen.queryByLabelText("investment.overview.emptyAdd")).toBeNull();
  });
});

it("SHOULD render on a phone too, with the last point chosen", () => {
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("compact");
  setup();

  expect(screen.getByTestId(overviewTestIds.evolutionDetail)).toBeOnTheScreen();
});
