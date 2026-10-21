import { act, renderHook } from "@tests";

import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";

import useOverviewFilters, { resetOverviewFilters } from "./useOverviewFilters";

beforeEach(() => {
  jest.useFakeTimers();
  act(() => resetOverviewFilters());
});
afterEach(() => jest.useRealTimers());

it("SHOULD start empty, apply a replacement AND clear one group or all", () => {
  const { result } = renderHook(() => useOverviewFilters());

  expect(result.current.filters).toEqual(EMPTY_FILTERS);
  act(() =>
    result.current.replace({
      ...EMPTY_FILTERS,
      categoryIds: ["c"],
      tagIds: ["t"],
    }),
  );
  expect(result.current.filters.categoryIds).toEqual(["c"]);
  act(() => result.current.removeGroup("categories"));
  expect(result.current.filters.categoryIds).toEqual([]);
  expect(result.current.filters.tagIds).toEqual(["t"]);
  act(() => result.current.clearAll());
  expect(result.current.filters).toEqual(EMPTY_FILTERS);
});

it("SHOULD apply the search 300 ms after the last keystroke AND a cleared one at once", () => {
  const { result } = renderHook(() => useOverviewFilters());

  act(() => result.current.setSearch("mar"));
  expect(result.current.applied.search).toBe("");
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(result.current.applied.search).toBe("mar");
  act(() => result.current.setSearch(""));
  expect(result.current.applied.search).toBe("");
});
