import { act, renderHook } from "@tests";

import {
  QuoteRefreshTooSoon,
  QuoteSourceUnavailable,
} from "@domain/entities/errors";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import useQuoteRefresh from "./useQuoteRefresh";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    refreshInvestmentQuotesUseCase: {
      execute: jest.fn(),
      uniqueName: "refresh",
    },
  },
}));

const mutation = new UseMutationFixture();

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-11-04T16:00:00Z"));
  jest.clearAllMocks();
  mutation.reset();
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

afterEach(() => jest.useRealTimers());

describe("useQuoteRefresh", () => {
  it("SHOULD send the asset ids on refresh AND ignore a second press while running", () => {
    mutation.reset().withIsFetching(true);
    const { result } = renderHook(() => useQuoteRefresh(["a1"]));

    act(() => result.current.onRefresh());

    expect(mutation.value.mutate).not.toHaveBeenCalled();
    expect(result.current.disabled).toBe(true);
    expect(result.current.isRefreshing).toBe(true);

    mutation.reset();
    const idle = renderHook(() => useQuoteRefresh(["a1"]));
    act(() => idle.result.current.onRefresh());

    expect(mutation.value.mutate).toHaveBeenCalledWith({ assetIds: ["a1"] });
  });

  it("SHOULD count down to nextRefreshAt after a refresh, invalidate the investment data AND flag a stale source", () => {
    mutation
      .reset()
      .withStatus("success")
      .withData({
        fx: null,
        nextRefreshAt: "2026-11-04T16:00:03.000Z",
        quotes: [{ stale: true }],
      } as never);
    const { result } = renderHook(() => useQuoteRefresh());

    expect(result.current.secondsLeft).toBe(3);
    expect(result.current.disabled).toBe(true);
    expect(result.current.sourceDown).toBe(true);
    expect(invalidateFetcherData).toHaveBeenCalledWith(["investment"]);

    for (let second = 0; second < 3; second += 1) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.disabled).toBe(false);
  });

  it("SHOULD disable the button for the seconds the API says WHEN it answers 429", () => {
    mutation.reset().withError(new QuoteRefreshTooSoon(42) as never);

    expect(renderHook(() => useQuoteRefresh()).result.current.secondsLeft).toBe(
      42,
    );
  });

  it("SHOULD flag the source down WHEN it answers 503", () => {
    mutation.reset().withError(new QuoteSourceUnavailable() as never);

    expect(renderHook(() => useQuoteRefresh()).result.current.sourceDown).toBe(
      true,
    );
  });

  it("SHOULD handle one answer only once", () => {
    mutation
      .reset()
      .withStatus("success")
      .withData({
        fx: null,
        nextRefreshAt: "2026-11-04T16:00:30.000Z",
        quotes: [],
      } as never);
    const { rerender } = renderHook(() => useQuoteRefresh());

    rerender({});

    expect(invalidateFetcherData).toHaveBeenCalledTimes(1);
  });
});
