import { fireEvent, screen } from "@tests";

import * as theme from "@presentation/theme";
import settingsTestIds from "@screens/Investment/Settings/testIds";

import { handlers, history, setup } from "./mocks/index.mocks";

const ids = settingsTestIds.history;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(theme, "useBreakpoint").mockReturnValue("expanded");
});

it("SHOULD show the title, the chart, the changes table AND the followers", () => {
  setup();

  expect(
    screen.getByText(/investment.settings.history.title/),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(ids.chart)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.changes)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.followers)).toBeOnTheScreen();
  expect(screen.getByText(/^14[.,]90%$/)).toBeOnTheScreen();
  expect(
    screen.getByText("investment.settings.history.note"),
  ).toBeOnTheScreen();
});

it("SHOULD open the title of a follower", () => {
  setup();

  fireEvent.press(screen.getByTestId(ids.follower("asset-1")));

  expect(handlers.onAssetPress).toHaveBeenCalledWith("asset-1");
});

it("SHOULD change the period", () => {
  setup();

  fireEvent.press(screen.getByText("investment.settings.history.period.5y"));

  expect(handlers.onPeriodChange).toHaveBeenCalledWith("5y");
});

it("SHOULD show monthly points without the changes table for the IPCA", () => {
  setup({
    history: {
      changes: [],
      followers: [],
      index: "IPCA",
      points: [{ accumulated12m: "4.63", month: "2026-10", monthly: "0.14" }],
    },
    index: "IPCA",
  });

  expect(screen.getByTestId(ids.chart)).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.changes)).toBeNull();
  expect(screen.queryByTestId(ids.followers)).toBeNull();
  expect(screen.queryByText("investment.settings.history.note")).toBeNull();
});

it("SHOULD say there is no change WHEN the period has no point", () => {
  setup({ history: { ...history, changes: [], followers: [], points: [] } });

  expect(
    screen.getByText("investment.settings.history.noChanges"),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.chart)).toBeNull();
});

it("SHOULD show the retry WHEN the load failed AND skeletons while loading", () => {
  setup({ history: undefined, isError: true });
  fireEvent.press(screen.getByText("investment.settings.retry"));
  expect(handlers.onRetry).toHaveBeenCalledTimes(1);

  setup({ history: undefined, isLoading: true });
  expect(screen.queryByTestId(ids.chart)).toBeNull();
});
