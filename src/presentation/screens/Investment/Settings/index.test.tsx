import { fireEvent, screen } from "@tests";

import * as theme from "@presentation/theme";

import { handlers, indexes, setup } from "./mocks/index.mocks";
import settingsTestIds from "./testIds";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("expanded");
});

it("SHOULD show the module AND the Settings section in the header, the subtitle AND when it was updated", () => {
  setup();

  expect(screen.getByText("navigation.tabs.investments")).toBeOnTheScreen();
  expect(
    screen.getAllByText("investment.sections.settings").length,
  ).toBeGreaterThan(0);
  expect(screen.getByText("investment.settings.subtitle")).toBeOnTheScreen();
  expect(screen.getByTestId(settingsTestIds.updatedAt)).toBeOnTheScreen();
});

it("SHOULD show the three index cards with their values AND the followers", () => {
  setup();

  expect(screen.getByTestId(settingsTestIds.card("cdi"))).toBeOnTheScreen();
  expect(screen.getByTestId(settingsTestIds.card("selic"))).toBeOnTheScreen();
  expect(screen.getByTestId(settingsTestIds.card("ipca"))).toBeOnTheScreen();
  expect(screen.getByText(/^14[.,]90%$/)).toBeOnTheScreen();
  expect(screen.getByText(/^15[.,]00%$/)).toBeOnTheScreen();
  expect(screen.getByText(/^4[.,]68%$/)).toBeOnTheScreen();
  expect(screen.getByText("4")).toBeOnTheScreen();
});

it("SHOULD open the history of the chosen index", () => {
  setup();

  fireEvent.press(screen.getByTestId(settingsTestIds.history.open("IPCA")));
  fireEvent.press(screen.getByTestId(settingsTestIds.history.open("CDI")));

  expect(handlers.onOpenHistory).toHaveBeenNthCalledWith(1, "IPCA");
  expect(handlers.onOpenHistory).toHaveBeenNthCalledWith(2, "CDI");
});

it("SHOULD show the FX pairs, read only, AND where the values come from", () => {
  setup();

  expect(screen.getByTestId(settingsTestIds.fx)).toBeOnTheScreen();
  expect(screen.getByText("USD → BRL")).toBeOnTheScreen();
  expect(screen.getByTestId(settingsTestIds.source)).toBeOnTheScreen();
});

it("SHOULD hide the FX section WHEN no pair is stored", () => {
  setup({ data: { ...indexes, fx: [] } });

  expect(screen.queryByTestId(settingsTestIds.fx)).toBeNull();
});

it("SHOULD refresh from the header button", () => {
  setup();

  fireEvent.press(screen.getByTestId(settingsTestIds.refresh));

  expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
});

it("SHOULD warn WHEN an index is stale, with the last value kept", () => {
  setup({
    notice: {
      date: "09/11/2026",
      index: "CDI",
      value: "14,90",
      valueDate: "08/11/2026",
    },
  });

  expect(screen.getByTestId(settingsTestIds.staleBanner)).toBeOnTheScreen();
  expect(screen.getByText(/investment.settings.stale/)).toBeOnTheScreen();
});

it("SHOULD show the empty state with Fetch now BEFORE the first run", () => {
  setup({ data: undefined, isEmpty: true });

  expect(screen.getByTestId(settingsTestIds.empty)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(settingsTestIds.emptyFetch));

  expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId(settingsTestIds.card("cdi"))).toBeNull();
});

it("SHOULD show skeletons while loading, no cards AND no empty state", () => {
  setup({ data: undefined, isLoading: true });
  expect(screen.queryByTestId(settingsTestIds.card("cdi"))).toBeNull();
  expect(screen.queryByTestId(settingsTestIds.empty)).toBeNull();
});

it("SHOULD show the retry WHEN the load failed", () => {
  setup({ data: undefined, isError: true });

  expect(screen.getByTestId(settingsTestIds.errorRetry)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("investment.settings.retry"));

  expect(handlers.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the minute limit toast", () => {
  setup({ toastVisible: true });

  expect(screen.getByText("investment.settings.tooMany")).toBeOnTheScreen();
});
