import { renderHook } from "@tests";

import useStableCallback from ".";

it("SHOULD keep the same function WHEN rendered with a new closure", () => {
  const { rerender, result } = renderHook(
    ({ fn }: { fn: () => number }) => useStableCallback(fn),
    { initialProps: { fn: () => 1 } },
  );
  const first = result.current;

  rerender({ fn: () => 2 });

  expect(result.current).toBe(first);
});

it("SHOULD call the latest closure WHEN invoked after a rerender", () => {
  const { rerender, result } = renderHook(
    ({ fn }: { fn: (value: number) => number }) => useStableCallback(fn),
    { initialProps: { fn: (value: number) => value + 1 } },
  );

  rerender({ fn: (value: number) => value * 10 });

  expect(result.current(4)).toBe(40);
});
