import { act, renderHook } from "@tests";

import useDebouncedValue, { PREVIEW_DEBOUNCE_MS } from "./useDebouncedValue";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => jest.useRealTimers());

it("SHOULD keep the last value until the delay passes without changes", () => {
  const { rerender, result } = renderHook(
    ({ value }: { value: string }) => useDebouncedValue(value),
    { initialProps: { value: "a" } },
  );

  rerender({ value: "b" });
  act(() => jest.advanceTimersByTime(PREVIEW_DEBOUNCE_MS - 1));

  expect(result.current).toBe("a");

  rerender({ value: "c" });
  act(() => jest.advanceTimersByTime(PREVIEW_DEBOUNCE_MS - 1));

  expect(result.current).toBe("a");

  act(() => jest.advanceTimersByTime(1));

  expect(result.current).toBe("c");
});
