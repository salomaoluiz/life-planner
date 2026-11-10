import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import {
  InvestmentAssetStatus,
  InvestmentPriceKind,
} from "@domain/entities/investment/enums";
import * as theme from "@presentation/theme";
import {
  makeDetail,
  makePosition,
  makeQuote,
  makeUsdAsset,
} from "@screens/Investment/mocks/fixtures";
import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.detail;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("expanded");
});

it("SHOULD render the six summary cards, the operations AND the valuations", () => {
  setup();

  for (const id of [
    ids.quantity,
    ids.averagePrice,
    ids.cost,
    ids.currentValue,
    ids.openResult,
    ids.realized,
  ]) {
    expect(screen.getByTestId(id)).toBeOnTheScreen();
  }
  expect(hasText("investment.operation.SELL")).toBe(true);
  expect(hasText("investment.operation.BUY")).toBe(true);
  expect(screen.getByTestId(`${ids.operationRow}-op-sell`)).toBeOnTheScreen();
  expect(screen.getByTestId(`${ids.valuationRow}-val-1`)).toBeOnTheScreen();
  expect(hasText("investment.detail.sells_one")).toBe(false);
});

it("SHOULD call the header actions", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.updateValue));
  fireEvent.press(screen.getByTestId(ids.addOperation));
  fireEvent.press(screen.getByTestId(ids.actionsMenu));
  fireEvent.press(screen.getByTestId(ids.back));

  expect(vm.onUpdateValue).toHaveBeenCalledTimes(1);
  expect(vm.onAddOperation).toHaveBeenCalledTimes(1);
  expect(vm.onMenuOpen).toHaveBeenCalledTimes(1);
  expect(vm.onBack).toHaveBeenCalledTimes(1);
});

it("SHOULD open an operation AND delete a valuation", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(`${ids.operationRow}-op-1`));
  fireEvent.press(screen.getByTestId(`${ids.valuationDelete}-val-1`));

  expect(vm.onOperationPress).toHaveBeenCalledWith("op-1");
  expect(vm.onDeleteValuation).toHaveBeenCalledWith("val-1");
});

it("SHOULD show the menu actions AND the delete dialog", () => {
  const { vm } = setup({ isDeleteOpen: true, isMenuOpen: true });

  fireEvent.press(screen.getByTestId(ids.editMenu));
  fireEvent.press(screen.getByTestId(ids.archiveMenu));
  fireEvent.press(screen.getByTestId(ids.deleteMenu));

  expect(vm.onEdit).toHaveBeenCalledTimes(1);
  expect(vm.onArchiveToggle).toHaveBeenCalledTimes(1);
  expect(vm.onDeleteOpen).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId(ids.deleteDialog)).toBeOnTheScreen();
  expect(hasText("investment.asset.deleteConfirm")).toBe(true);
});

it("SHOULD show the archived banner with the reactivate action AND hide the new operation", () => {
  const { vm } = setup({
    archived: true,
    archivedAt: "2026-10-20T00:00:00Z",
    asset: makeDetail({ status: InvestmentAssetStatus.ARCHIVED }),
  });

  fireEvent.press(screen.getByText("investment.archive.reactivate"));

  expect(vm.onArchiveToggle).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId(ids.archiveBanner)).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.addOperation)).toBeNull();
  expect(screen.queryByTestId(`${ids.valuationDelete}-val-1`)).toBeNull();
});

it("SHOULD render the empty states AND the missing value", () => {
  setup({
    asset: makeDetail({
      operationCount: 0,
      operations: [],
      position: makePosition({
        averagePrice: null,
        currentUnitPrice: null,
        currentValue: null,
        currentValueDate: null,
        openResult: null,
        openResultPercent: null,
        realizedResult: 0,
      }),
      valuations: [],
    }),
    sellCount: 0,
  });

  expect(hasText("investment.detail.operationsEmpty")).toBe(true);
  expect(hasText("investment.detail.valuationsEmpty")).toBe(true);
  expect(hasText("investment.position.noValue")).toBe(true);
});

it("SHOULD show the error message of a failed action", () => {
  setup({ errorMessage: { key: "investment.errors.archived" } });

  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ asset: undefined, isLoading: true });
  expect(screen.getByTestId(ids.screen)).toBeOnTheScreen();

  const { vm } = setup({ asset: undefined, isNotFound: true });
  fireEvent.press(screen.getAllByText("investment.detail.back")[0]);
  expect(vm.onBack).toHaveBeenCalled();
});

it("SHOULD hide the actions WHEN read-only", () => {
  setup({ readOnly: true });

  expect(screen.queryByTestId(ids.updateValue)).toBeNull();
  expect(screen.queryByTestId(ids.actionsMenu)).toBeNull();
});

it("SHOULD stack the cards on a compact width", () => {
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("compact");
  setup({ ownerLabel: "Test Family" });

  expect(screen.getByTestId(ids.quantity)).toBeOnTheScreen();
  expect(hasText("Test Family")).toBe(true);
});

describe("quotes (spec 104)", () => {
  function usd() {
    return makeDetail(makeUsdAsset());
  }

  it("SHOULD show the price block, the BRL result card AND the quote panel of a USD asset", () => {
    setup({ asset: usd() });

    expect(screen.getByTestId(ids.priceBlock)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.price)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.openResultBrl)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.quotePanel)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.brlSplit)).toBeOnTheScreen();
    expect(hasText("investment.result.usd")).toBe(true);
    expect(hasText("investment.result.brl")).toBe(true);
    expect(screen.getByTestId(ids.chart)).toBeOnTheScreen();
  });

  it("SHOULD refresh quotes WHEN the button is pressed AND show the countdown", () => {
    const { vm } = setup({
      asset: usd(),
      quotesDisabled: true,
      quotesSecondsLeft: 42,
    });

    fireEvent.press(screen.getByTestId(ids.refreshQuotes));

    expect(screen.getByTestId(ids.refreshCountdown)).toBeOnTheScreen();
    expect(
      screen.getByText(/investment\.quote\.availableIn/),
    ).toBeOnTheScreen();
    expect(vm.onQuotesRefresh).not.toHaveBeenCalled();
  });

  it("SHOULD call the refresh WHEN available", () => {
    const { vm } = setup({ asset: usd() });

    fireEvent.press(screen.getByTestId(ids.refreshQuotes));

    expect(vm.onQuotesRefresh).toHaveBeenCalledTimes(1);
  });

  it("SHOULD warn WHEN the source is down", () => {
    setup({ asset: usd(), quotesSourceDown: true });

    expect(screen.getByTestId(ids.sourceDownBanner)).toBeOnTheScreen();
  });

  it("SHOULD offer the manual value AND going back to the automatic quote WHEN a manual value wins", () => {
    const { vm } = setup({ asset: usd(), manualOverQuote: true });

    fireEvent.press(screen.getByTestId(ids.enterManual));
    fireEvent.press(screen.getByTestId(ids.backToAuto));

    expect(vm.onUpdateValue).toHaveBeenCalledTimes(1);
    expect(vm.onBackToAutomatic).toHaveBeenCalledTimes(1);
  });

  it("SHOULD hide the manual actions WHEN read only AND explain an unavailable quote", () => {
    setup({
      asset: makeDetail(
        makeUsdAsset({ quote: makeQuote({ unavailable: true }) }),
      ),
      readOnly: true,
    });

    expect(screen.queryByTestId(ids.enterManual)).toBeNull();
    expect(
      screen.getByText(/investment\.quote\.unavailableBody/),
    ).toBeOnTheScreen();
  });

  it("SHOULD draw the history WITH its legends AND switch the range and the mode", () => {
    const { vm } = setup({
      asset: usd(),
      history: {
        currency: "USD",
        historyStartsAt: "2026-11-04",
        points: [
          {
            date: "2025-11-04",
            fxRate: "5.2",
            kind: InvestmentPriceKind.OPERATION,
            price: "182.1",
          },
          {
            date: "2026-11-04",
            fxRate: "5.5",
            kind: InvestmentPriceKind.CLOSE,
            price: "228.5",
          },
          {
            date: "2026-11-05",
            fxRate: "5.5",
            kind: InvestmentPriceKind.CLOSE,
            price: "231.4",
          },
        ],
      },
    });

    expect(
      screen.getByText(/investment\.history\.dashedLegend/),
    ).toBeOnTheScreen();
    expect(screen.getByText(/investment\.history\.startsAt/)).toBeOnTheScreen();

    fireEvent.press(screen.getByText("investment.history.sixMonths"));
    fireEvent.press(screen.getByText("investment.history.modePosition"));

    expect(vm.onRangeChange).toHaveBeenCalledWith("6M");
    expect(vm.onChartModeChange).toHaveBeenCalledWith("position");
  });

  it("SHOULD not show the chart for an asset without a ticker, nor the refresh button without a quote", () => {
    setup({ asset: makeDetail({ quote: null, ticker: null }) });

    expect(screen.queryByTestId(ids.chart)).toBeNull();
    expect(screen.queryByTestId(ids.refreshQuotes)).toBeNull();
    expect(screen.queryByTestId(ids.priceBlock)).toBeOnTheScreen();
  });

  it("SHOULD show the loading state of the history", () => {
    setup({ asset: usd(), historyLoading: true });

    expect(screen.getByTestId(ids.chart)).toBeOnTheScreen();
  });
});
