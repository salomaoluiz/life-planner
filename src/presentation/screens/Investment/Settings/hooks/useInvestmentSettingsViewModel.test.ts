import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { QuoteRefreshTooSoon } from "@domain/entities/errors";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useInvestmentSettingsViewModel from "./useInvestmentSettingsViewModel";

const mockOpenModal = jest.fn();

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ openModal: mockOpenModal }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentMarketIndexesUseCase: {
      execute: jest.fn(),
      uniqueName: "indexes",
    },
    refreshInvestmentMarketIndexesUseCase: {
      execute: jest.fn(),
      uniqueName: "refresh",
    },
  },
}));

const query = new UseQueryFixture();
const mutation = new UseMutationFixture();
const indexes = {
  cdi: null,
  fx: [],
  ipca: null,
  lastSuccessAt: null,
  selic: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  query.reset();
  mutation.reset();
  jest.mocked(useQuery).mockImplementation((() => query.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

describe("useInvestmentSettingsViewModel", () => {
  it("SHOULD read the indexes with the shared key through the use case", async () => {
    query.withData(indexes as never);
    renderHook(() => useInvestmentSettingsViewModel());

    const props = jest.mocked(useQuery).mock.calls[0][0];

    expect(props.cacheKey).toEqual(["investment", "market-indexes"]);
    await props.fetch();
    expect(
      useCases.getInvestmentMarketIndexesUseCase.execute,
    ).toHaveBeenCalledWith();
  });

  it("SHOULD flag the empty state BEFORE the first run AND not while loading", () => {
    query.withData(indexes as never);
    expect(
      renderHook(() => useInvestmentSettingsViewModel()).result.current.isEmpty,
    ).toBe(true);

    query.reset().withStatus("pending");
    const loading = renderHook(() => useInvestmentSettingsViewModel()).result
      .current;

    expect(loading.isLoading).toBe(true);
    expect(loading.isEmpty).toBe(false);
  });

  it("SHOULD flag an error only WHEN there is no data to show", () => {
    query.withStatus("error");
    expect(
      renderHook(() => useInvestmentSettingsViewModel()).result.current.isError,
    ).toBe(true);

    query
      .reset()
      .withStatus("error")
      .withData(indexes as never);
    expect(
      renderHook(() => useInvestmentSettingsViewModel()).result.current.isError,
    ).toBe(false);
  });

  it("SHOULD open the history of the chosen index in the modal", () => {
    query.withData(indexes as never);
    const { result } = renderHook(() => useInvestmentSettingsViewModel());

    act(() => result.current.onOpenHistory("IPCA"));

    expect(mockOpenModal).toHaveBeenCalledWith("investment_index_history", {
      index: "IPCA",
    });
  });

  it("SHOULD refresh once, ignoring a press while it runs", () => {
    query.withData(indexes as never);
    const idleMutate = mutation.value.mutate;
    const idle = renderHook(() => useInvestmentSettingsViewModel());

    act(() => idle.result.current.onRefresh());
    expect(idleMutate).toHaveBeenCalledTimes(1);

    mutation.reset().withIsFetching(true);
    const running = renderHook(() => useInvestmentSettingsViewModel());

    act(() => running.result.current.onRefresh());
    expect(mutation.value.mutate).not.toHaveBeenCalled();
    expect(running.result.current.refreshing).toBe(true);
  });

  it("SHOULD reload the investment data AFTER a refresh", () => {
    query.withData(indexes as never);
    mutation.withStatus("success");
    renderHook(() => useInvestmentSettingsViewModel());

    expect(invalidateFetcherData).toHaveBeenCalledWith(["investment"]);
    expect(mutation.value.reset).toHaveBeenCalled();
  });

  it("SHOULD show the toast WHEN the minute limit answers 429", () => {
    query.withData(indexes as never);
    mutation.withError(new QuoteRefreshTooSoon(42));
    const { result } = renderHook(() => useInvestmentSettingsViewModel());

    expect(result.current.toastVisible).toBe(true);

    act(() => result.current.onToastHide());
    expect(result.current.toastVisible).toBe(false);
  });
});
