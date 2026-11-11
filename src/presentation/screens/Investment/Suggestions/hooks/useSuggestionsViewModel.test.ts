import { router } from "expo-router";

import { renderHook } from "@tests";

import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { makeSuggestion } from "@screens/Investment/mocks/fixtures";

import useSuggestionsViewModel from "./useSuggestionsViewModel";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock(
  "@screens/Investment/Income/hooks/useIncomeSuggestionActions",
  () => ({
    __esModule: true,
    default: () => ({ failure: undefined, isBusy: false }),
  }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentIncomeSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
  },
}));

const query = new UseQueryFixture();

beforeEach(() => {
  jest.clearAllMocks();
  query.reset();
  jest.mocked(useQuery).mockImplementation((() => query.build()) as never);
});

it("SHOULD be loading until the first answer", () => {
  query.value.isFetching = true;

  expect(
    renderHook(() => useSuggestionsViewModel()).result.current,
  ).toMatchObject({
    count: 0,
    isEmpty: false,
    isLoading: true,
  });
});

it("SHOULD list the suggestions with the count", () => {
  query.withData([makeSuggestion(), makeSuggestion({ id: "sug-2" })]);

  expect(
    renderHook(() => useSuggestionsViewModel()).result.current,
  ).toMatchObject({
    count: 2,
    isEmpty: false,
    isLoading: false,
  });
});

it("SHOULD be empty WHEN nothing was announced", () => {
  query.withData([]);

  expect(
    renderHook(() => useSuggestionsViewModel()).result.current.isEmpty,
  ).toBe(true);
});

it("SHOULD expose the error, retry AND go back to the list", async () => {
  query.withError();
  const { result } = renderHook(() => useSuggestionsViewModel());

  expect(result.current.errorMessage).toBeDefined();
  await result.current.onRetry();
  result.current.onBack();

  expect(query.value.refetch).toHaveBeenCalled();
  expect(router.replace).toHaveBeenCalledWith("/investments");
});
