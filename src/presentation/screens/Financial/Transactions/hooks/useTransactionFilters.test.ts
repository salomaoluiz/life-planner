import { act, renderHook } from "@tests";

import { EMPTY_FILTERS } from "../models/transactionFilters";
import useTransactionFilters, {
  resetTransactionFilters,
} from "./useTransactionFilters";

beforeEach(() => {
  jest.useFakeTimers();
  resetTransactionFilters();
});
afterEach(() => jest.useRealTimers());

it("SHOULD start empty", () => {
  const { result } = renderHook(() => useTransactionFilters());

  expect(result.current.filters).toEqual(EMPTY_FILTERS);
  expect(result.current.applied).toEqual(EMPTY_FILTERS);
});

it("SHOULD apply the search to the queries only after 300 ms", () => {
  const { result } = renderHook(() => useTransactionFilters());

  act(() => result.current.setSearch("merc"));
  act(() => result.current.setSearch("mercado"));
  expect(result.current.filters.search).toBe("mercado");
  expect(result.current.applied.search).toBe("");

  act(() => {
    jest.advanceTimersByTime(299);
  });
  expect(result.current.applied.search).toBe("");

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(result.current.applied.search).toBe("mercado");
});

it("SHOULD apply a cleared search at once", () => {
  const { result } = renderHook(() => useTransactionFilters());

  act(() => result.current.setSearch("a"));
  act(() => {
    jest.advanceTimersByTime(300);
  });
  act(() => result.current.setSearch(""));

  expect(result.current.applied.search).toBe("");
});

it("SHOULD keep the filters when the screen unmounts and mounts again, and drop one group at a time", () => {
  const first = renderHook(() => useTransactionFilters());

  act(() =>
    first.result.current.replace({
      ...EMPTY_FILTERS,
      categoryIds: ["c1"],
      situation: "UNPAID",
    }),
  );
  first.unmount();

  const second = renderHook(() => useTransactionFilters());

  expect(second.result.current.filters.categoryIds).toEqual(["c1"]);

  act(() => second.result.current.removeGroup("categories"));
  expect(second.result.current.filters).toEqual({
    ...EMPTY_FILTERS,
    situation: "UNPAID",
  });

  act(() => second.result.current.clearAll());
  expect(second.result.current.filters).toEqual(EMPTY_FILTERS);
});
