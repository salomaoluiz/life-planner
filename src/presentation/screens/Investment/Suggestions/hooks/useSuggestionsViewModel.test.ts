import { router } from "expo-router";

import { act, renderHook } from "@tests";

import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import {
  makeEventSuggestion,
  makeSuggestion,
} from "@screens/Investment/mocks/fixtures";

import useSuggestionsViewModel from "./useSuggestionsViewModel";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/Events/hooks/useEventSuggestionActions", () => ({
  __esModule: true,
  default: () => ({ failure: undefined, isBusy: false }),
}));
jest.mock(
  "@screens/Investment/Income/hooks/useIncomeSuggestionActions",
  () => ({
    __esModule: true,
    default: () => ({ failure: undefined, isBusy: false }),
  }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentEventSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "event-suggestions",
    },
    getInvestmentIncomeSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
  },
}));

const query = new UseQueryFixture();
// The income list is the fixture under test; the event list is empty unless a test says otherwise.
const noEvents = new UseQueryFixture();

beforeEach(() => {
  jest.clearAllMocks();
  query.reset();
  noEvents.reset().withData([]);
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey.includes("event-suggestions")
        ? noEvents
        : query
      ).build()) as never);
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

describe("corporate events (spec 108)", () => {
  const income = new UseQueryFixture();
  const events = new UseQueryFixture();

  beforeEach(() => {
    income.reset().withData([makeSuggestion()]);
    events
      .reset()
      .withData([makeEventSuggestion(), makeEventSuggestion({ id: "esug-2" })]);
    jest
      .mocked(useQuery)
      .mockImplementation(((props: { cacheKey: string[] }) =>
        (props.cacheKey.includes("event-suggestions")
          ? events
          : income
        ).build()) as never);
  });

  it("SHOULD count incomes AND events, each tab with its own number", () => {
    const { result } = renderHook(() => useSuggestionsViewModel());

    expect(result.current).toMatchObject({
      count: 3,
      counts: { all: 3, events: 2, income: 1 },
      filter: "ALL",
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.eventItems).toHaveLength(2);
  });

  it("SHOULD show only the events or only the incomes by tab", () => {
    const { result } = renderHook(() => useSuggestionsViewModel());

    act(() => result.current.onFilterChange("EVENT"));
    expect(result.current.items).toEqual([]);
    expect(result.current.eventItems).toHaveLength(2);

    act(() => result.current.onFilterChange("INCOME"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.eventItems).toEqual([]);
  });

  it("SHOULD be empty only WHEN both lists answered AND the tab shows nothing", () => {
    events.withData([]);
    const { result } = renderHook(() => useSuggestionsViewModel());

    act(() => result.current.onFilterChange("EVENT"));

    expect(result.current.isEmpty).toBe(true);

    act(() => result.current.onFilterChange("INCOME"));

    expect(result.current.isEmpty).toBe(false);
  });

  it("SHOULD stay loading until both lists arrive AND report either error", () => {
    events.reset();
    events.value.isFetching = true;

    expect(
      renderHook(() => useSuggestionsViewModel()).result.current.isLoading,
    ).toBe(true);

    events.reset().withData([]).withError();

    expect(
      renderHook(() => useSuggestionsViewModel()).result.current.errorMessage,
    ).toBeDefined();
  });

  it("SHOULD refetch both lists on retry", async () => {
    const { result } = renderHook(() => useSuggestionsViewModel());

    await act(async () => result.current.onRetry());

    expect(income.value.refetch).toHaveBeenCalled();
    expect(events.value.refetch).toHaveBeenCalled();
  });
});
