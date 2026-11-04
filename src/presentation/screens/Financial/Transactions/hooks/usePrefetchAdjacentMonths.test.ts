import { InteractionManager } from "react-native";

import { act, renderHook } from "@tests";

import { prefetchFetcherData } from "@infrastructure/fetcher";
import isSlowConnection from "@infrastructure/network/isSlowConnection";

import usePrefetchAdjacentMonths, {
  PREFETCH_IDLE_MS,
} from "./usePrefetchAdjacentMonths";

jest.mock("@infrastructure/fetcher", () => ({
  prefetchFetcherData: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@infrastructure/network/isSlowConnection", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}));

const fetchMonth = jest.fn().mockResolvedValue({});

function setup(
  overrides: Partial<Parameters<typeof usePrefetchAdjacentMonths>[0]> = {},
) {
  return renderHook(
    (props: Parameters<typeof usePrefetchAdjacentMonths>[0]) =>
      usePrefetchAdjacentMonths(props),
    {
      initialProps: {
        cacheKey: (monthKey: string) => ["list", monthKey, "owner"],
        enabled: true,
        fetch: fetchMonth,
        monthKeys: ["2026-10", "2026-12"],
        ...overrides,
      },
    },
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(isSlowConnection).mockReturnValue(false);
  jest
    .spyOn(InteractionManager, "runAfterInteractions")
    .mockImplementation((task) => {
      if (typeof task === "function") {
        task();
      }

      return { cancel: jest.fn() } as never;
    });
});

afterEach(() => {
  jest.useRealTimers();
});

it("SHOULD prefetch the previous and next month with the screen's keys once idle", async () => {
  setup();

  expect(prefetchFetcherData).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));

  expect(prefetchFetcherData).toHaveBeenCalledTimes(2);
  expect(prefetchFetcherData).toHaveBeenCalledWith(
    expect.objectContaining({ cacheKey: ["list", "2026-10", "owner"] }),
  );
  expect(prefetchFetcherData).toHaveBeenCalledWith(
    expect.objectContaining({ cacheKey: ["list", "2026-12", "owner"] }),
  );
  const { fetch } = jest.mocked(prefetchFetcherData).mock.calls[0][0];

  await fetch();
  expect(fetchMonth).toHaveBeenCalledWith("2026-10");
});

it("SHOULD send nothing WHEN disabled (loading, a write is pending, filtering, not focused)", () => {
  setup({ enabled: false });
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS * 2));

  expect(prefetchFetcherData).not.toHaveBeenCalled();
});

it("SHOULD send nothing WHEN the connection is slow", () => {
  jest.mocked(isSlowConnection).mockReturnValue(true);
  setup();
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));

  expect(prefetchFetcherData).not.toHaveBeenCalled();
});

it("SHOULD send nothing WHEN it unmounts before the idle time", () => {
  const view = setup();

  view.unmount();
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS * 2));

  expect(prefetchFetcherData).not.toHaveBeenCalled();
});

it("SHOULD cancel WHEN a write starts before the idle time, and resume after it", () => {
  const view = setup();

  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS - 1));
  view.rerender({
    cacheKey: (monthKey: string) => ["list", monthKey, "owner"],
    enabled: false,
    fetch: fetchMonth,
    monthKeys: ["2026-10", "2026-12"],
  });
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));
  expect(prefetchFetcherData).not.toHaveBeenCalled();

  view.rerender({
    cacheKey: (monthKey: string) => ["list", monthKey, "owner"],
    enabled: true,
    fetch: fetchMonth,
    monthKeys: ["2026-10", "2026-12"],
  });
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));
  expect(prefetchFetcherData).toHaveBeenCalledTimes(2);
});

it("SHOULD restart for the new neighbours WHEN the month changes", () => {
  const view = setup();

  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));
  jest.clearAllMocks();
  view.rerender({
    cacheKey: (monthKey: string) => ["list", monthKey, "owner"],
    enabled: true,
    fetch: fetchMonth,
    monthKeys: ["2026-11", "2027-01"],
  });
  act(() => jest.advanceTimersByTime(PREFETCH_IDLE_MS));

  expect(prefetchFetcherData).toHaveBeenCalledTimes(2);
  expect(prefetchFetcherData).toHaveBeenCalledWith(
    expect.objectContaining({ cacheKey: ["list", "2027-01", "owner"] }),
  );
});
