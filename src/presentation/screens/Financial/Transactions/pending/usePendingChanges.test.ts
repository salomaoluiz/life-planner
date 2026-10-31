import { act, renderHook } from "@tests";

import { addChange, addFailure, resetPending } from "./pendingChanges";
import { usePendingChanges, usePendingFailures } from "./usePendingChanges";

beforeEach(() => resetPending());

it("SHOULD follow the pending changes", () => {
  const { result } = renderHook(() => usePendingChanges());

  expect(result.current).toHaveLength(0);
  act(() =>
    addChange({ description: "Lunch", id: "pending-1", kind: "create" }),
  );
  expect(result.current).toHaveLength(1);
});

it("SHOULD expose the first failure and move on when dismissed", () => {
  const { result } = renderHook(() => usePendingFailures());

  act(() => {
    addFailure({ description: "A", id: "1", kind: "create", retry: jest.fn() });
    addFailure({ description: "B", id: "2", kind: "edit", retry: jest.fn() });
  });
  expect(result.current.failure?.id).toBe("1");
  act(() => result.current.dismiss());
  expect(result.current.failure?.id).toBe("2");
});
