import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import * as theme from "@presentation/theme";
import { makeUsdAsset, owners } from "@screens/Investment/mocks/fixtures";
import {
  buildEntries,
  filterAssets,
} from "@screens/Investment/models/assetList";
import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("expanded");
});

it("SHOULD render the groups, rows AND the footnote", () => {
  setup();

  expect(screen.getByTestId(investmentTestIds.list.screen)).toBeOnTheScreen();
  expect(
    screen.getByTestId(investmentTestIds.list.group("BR_STOCK-BRL")),
  ).toBeOnTheScreen();
  expect(hasText("ITSA4")).toBe(true);
  expect(hasText("WEGE3")).toBe(true);
  expect(hasText("investment.position.noValue")).toBe(true);
  expect(screen.getByTestId(investmentTestIds.list.footnote)).toBeOnTheScreen();
  expect(hasText("investment.list.columns.result")).toBe(true);
});

it("SHOULD press a row AND the add button", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(`${investmentTestIds.list.row}-asset-1`));
  fireEvent.press(screen.getByTestId(investmentTestIds.list.addButton));

  expect(vm.onRowPress).toHaveBeenCalledWith("asset-1");
  expect(vm.onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render cards on a compact width", () => {
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("compact");
  setup();

  expect(
    screen.getByTestId(`${investmentTestIds.list.row}-asset-1`),
  ).toBeOnTheScreen();
  expect(hasText("investment.list.columns.openResult")).toBe(false);
});

it("SHOULD render skeletons WHEN loading", () => {
  setup({ entries: [], isLoading: true });

  expect(screen.getByTestId(investmentTestIds.list.skeleton)).toBeOnTheScreen();
});

it("SHOULD render the error state with a retry", () => {
  const { vm } = setup({ entries: [], errorMessage: "boom" });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(hasText("investment.errors.generic")).toBe(true);
  expect(vm.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state with the new asset action", () => {
  const { vm } = setup({ entries: [], hasAny: false, isEmpty: true });

  expect(
    screen.getByTestId(investmentTestIds.list.emptyState),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getAllByText("investment.list.newAsset")[0]);
  expect(vm.onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render the archived empty copy without an action", () => {
  setup({
    entries: [],
    hasAny: false,
    isEmpty: true,
    tab: "ARCHIVED" as never,
  });

  expect(hasText("investment.list.emptyArchivedTitle")).toBe(true);
  expect(screen.queryByText("investment.list.newAsset")).toBeNull();
});

it("SHOULD render no results with a clear action", () => {
  const { vm } = setup({ entries: [], noResults: true, search: "zzz" });

  fireEvent.press(screen.getByText("common.actions.clear"));

  expect(
    screen.getByTestId(investmentTestIds.list.noResults),
  ).toBeOnTheScreen();
  expect(vm.onSearchChange).toHaveBeenCalledWith("");
});

it("SHOULD hide the add button AND show the notice WHEN read-only", () => {
  setup({ readOnly: true });

  expect(screen.queryByTestId(investmentTestIds.list.addButton)).toBeNull();
  expect(
    screen.getByTestId(investmentTestIds.list.readOnlyBanner),
  ).toBeOnTheScreen();
});

describe("quotes (spec 104)", () => {
  const entries = buildEntries(
    filterAssets([makeUsdAsset()], owners, "ALL", ""),
  );

  it("SHOULD show price, today, value in BRL, result in BRL AND when it was updated", () => {
    setup({ entries, hasQuotes: true, quotesTime: "2026-11-04T16:00:00.000Z" });

    expect(
      screen.getByTestId(`${investmentTestIds.list.row}-asset-usd`),
    ).toBeOnTheScreen();
    expect(screen.getByText(/investment\.quote\.asOf/)).toBeOnTheScreen();
    expect(
      screen.getByTestId(investmentTestIds.list.quotesInfo),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${investmentTestIds.list.row}-asset-usd-updated`),
    ).toBeOnTheScreen();
  });

  it("SHOULD refresh the quotes AND show the countdown WHEN limited", () => {
    const { vm } = setup({
      entries,
      hasQuotes: true,
      quotesDisabled: true,
      quotesSecondsLeft: 30,
    });

    fireEvent.press(screen.getByTestId(investmentTestIds.list.refreshQuotes));

    expect(
      screen.getByTestId(investmentTestIds.list.refreshCountdown),
    ).toBeOnTheScreen();
    expect(vm.onQuotesRefresh).not.toHaveBeenCalled();
  });

  it("SHOULD call the refresh WHEN available AND warn WHEN the source is down", () => {
    const { vm } = setup({ entries, hasQuotes: true, quotesSourceDown: true });

    fireEvent.press(screen.getByTestId(investmentTestIds.list.refreshQuotes));

    expect(vm.onQuotesRefresh).toHaveBeenCalledTimes(1);
    expect(
      screen.getByTestId(investmentTestIds.list.sourceDownBanner),
    ).toBeOnTheScreen();
  });

  it("SHOULD hide the refresh button WHEN no asset has a quote", () => {
    setup({ hasQuotes: false });

    expect(
      screen.queryByTestId(investmentTestIds.list.refreshQuotes),
    ).toBeNull();
  });

  it("SHOULD use the compact card on a small screen", () => {
    jest.spyOn(theme, "useBreakpoint").mockReturnValue("compact");
    setup({ entries, hasQuotes: true });

    expect(
      screen.getByTestId(`${investmentTestIds.list.row}-asset-usd`),
    ).toBeOnTheScreen();
    expect(screen.getByText(/investment\.list\.todayShort/)).toBeOnTheScreen();
  });

  it("SHOULD flag an unavailable quote", () => {
    const unavailable = buildEntries(
      filterAssets(
        [
          makeUsdAsset({
            quote: { ...makeUsdAsset().quote!, unavailable: true },
          }),
        ],
        owners,
        "ALL",
        "",
      ),
    );
    setup({ entries: unavailable });

    expect(hasText("investment.quote.unavailable")).toBe(true);
  });
});
