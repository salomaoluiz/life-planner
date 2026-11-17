import { router, useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useIndexHistoryViewModel from "./useIndexHistoryViewModel";

const mockCloseModal = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ closeModal: mockCloseModal }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentMarketIndexHistoryUseCase: {
      execute: jest.fn(),
      uniqueName: "history",
    },
  },
}));

const query = new UseQueryFixture();

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-11-16T12:00:00Z"));
  jest.clearAllMocks();
  query.reset();
  jest.mocked(useQuery).mockImplementation((() => query.build()) as never);
  jest.mocked(useLocalSearchParams).mockReturnValue({ index: "IPCA" });
});
afterEach(() => jest.useRealTimers());

describe("useIndexHistoryViewModel", () => {
  it("SHOULD read the index of the route with the 12 months default AND the shared key", async () => {
    renderHook(() => useIndexHistoryViewModel());

    const props = jest.mocked(useQuery).mock.calls[0][0];

    expect(props.cacheKey).toEqual([
      "investment",
      "market-index-history",
      "IPCA",
      "2025-11-16",
      "2026-11-16",
    ]);
    expect(props.keepPreviousData).toBe(true);
    await props.fetch();
    expect(
      useCases.getInvestmentMarketIndexHistoryUseCase.execute,
    ).toHaveBeenCalledWith({
      from: "2025-11-16",
      index: "IPCA",
      to: "2026-11-16",
    });
  });

  it("SHOULD fall back to the CDI for an unknown index", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ index: "GOLD" });

    expect(
      renderHook(() => useIndexHistoryViewModel()).result.current.index,
    ).toBe("CDI");
  });

  it("SHOULD change the period AND ask for the new range", () => {
    const { result } = renderHook(() => useIndexHistoryViewModel());

    act(() => result.current.onPeriodChange("5y"));

    expect(result.current.period).toBe("5y");
    expect(jest.mocked(useQuery).mock.calls.at(-1)?.[0].cacheKey).toContain(
      "2021-11-16",
    );
  });

  it("SHOULD flag loading AND an error only WHEN there is no data", () => {
    query.withStatus("pending");
    expect(
      renderHook(() => useIndexHistoryViewModel()).result.current.isLoading,
    ).toBe(true);

    query.reset().withStatus("error");
    expect(
      renderHook(() => useIndexHistoryViewModel()).result.current.isError,
    ).toBe(true);

    query
      .reset()
      .withStatus("error")
      .withData({ changes: [] } as never);
    expect(
      renderHook(() => useIndexHistoryViewModel()).result.current.isError,
    ).toBe(false);
  });

  it("SHOULD close the modal AND open the title of a follower", () => {
    const { result } = renderHook(() => useIndexHistoryViewModel());

    act(() => result.current.onAssetPress("asset-1"));
    act(() => result.current.onClose());

    expect(router.push).toHaveBeenCalledWith("/investments/asset/asset-1");
    expect(mockCloseModal).toHaveBeenCalledTimes(2);
  });
});
