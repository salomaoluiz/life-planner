import { act, renderHook } from "@testing-library/react-native";

import { modalNavigation } from "@tests/modalNavigation";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useQuickAddViewModel, {
  SEARCH_DEBOUNCE_MS,
} from "./useQuickAddViewModel";

jest.mock("@infrastructure/fetcher", () => ({ useQuery: jest.fn() }));
jest.mock("@presentation/hooks/useOwners", () => ({
  __esModule: true,
  default: () => ({ data: [] }),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@presentation/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@screens/Stock/hooks/useStockQuickMovement", () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFrequentStockItemsUseCase: {
      execute: jest.fn(),
      uniqueName: "frequent",
    },
    getStockItemsUseCase: { execute: jest.fn(), uniqueName: "items" },
    suggestStockItemsUseCase: { execute: jest.fn(), uniqueName: "suggest" },
  },
}));

const queryMock = jest.mocked(useQuery);
const scopedMock = jest.mocked(useOwnerScopedQuery);
const milk = dto((f) => f.withId("milk").withDescription("Leite"));
const rice = dto((f) => f.withId("rice").withDescription("Arroz"));

function query(data?: unknown) {
  return {
    data,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status: "success",
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  queryMock.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey[0] === "frequent"
      ? query([milk])
      : query(["rice"])) as never);
  scopedMock.mockReturnValue(
    query({ items: [milk, rice], owners: [] }) as never,
  );
});

afterEach(() => jest.useRealTimers());

it("SHOULD list the frequent items WHEN the field is empty", () => {
  const { result } = renderHook(() => useQuickAddViewModel());

  expect(result.current.searching).toBe(false);
  expect(result.current.rows.map((row) => row.id)).toEqual(["milk"]);
});

it("SHOULD search only after 2 characters and 300 ms, listing the suggested items in order", () => {
  const { result } = renderHook(() => useQuickAddViewModel());

  act(() => result.current.onSearchChange("a"));
  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });

  expect(result.current.searching).toBe(false);

  act(() => result.current.onSearchChange("arr"));

  expect(result.current.searching).toBe(false);

  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });

  expect(result.current.searching).toBe(true);
  expect(result.current.rows.map((row) => row.id)).toEqual(["rice"]);
  expect(queryMock).toHaveBeenCalledWith(
    expect.objectContaining({ cacheKey: ["suggest", "arr"], enabled: true }),
  );
});

it("SHOULD report nothing found and open the new item form with the typed name", () => {
  queryMock.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey[0] === "frequent" ? query([]) : query([])) as never);

  const { result } = renderHook(() => useQuickAddViewModel());

  act(() => result.current.onSearchChange("xyz"));
  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });

  expect(result.current.isEmpty).toBe(true);

  act(() => result.current.onCreateFromSearch());

  expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
    "add_new_stock_item",
    {
      description: "xyz",
    },
  );
  expect(useCases.suggestStockItemsUseCase.execute).not.toHaveBeenCalled();
});
