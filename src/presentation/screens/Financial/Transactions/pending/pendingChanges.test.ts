import {
  addChange,
  addFailure,
  getChanges,
  getFailures,
  hasPendingChanges,
  newPendingId,
  removeChange,
  resetPending,
  shiftFailure,
  subscribe,
} from "./pendingChanges";

beforeEach(() => resetPending());

const change = {
  description: "Lunch",
  id: "pending-1",
  kind: "create" as const,
};

it("SHOULD notify subscribers once per change and keep the snapshot stable otherwise", () => {
  const listener = jest.fn();
  const unsubscribe = subscribe(listener);
  const before = getChanges();

  expect(getChanges()).toBe(before);
  addChange(change);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(getChanges()).not.toBe(before);
  expect(getChanges()).toHaveLength(1);
  removeChange("pending-1");
  expect(listener).toHaveBeenCalledTimes(2);
  expect(getChanges()).toHaveLength(0);
  unsubscribe();
  addChange(change);
  expect(listener).toHaveBeenCalledTimes(2);
});

it("SHOULD queue failures in order", () => {
  addFailure({ description: "A", id: "1", kind: "create", retry: jest.fn() });
  addFailure({ description: "B", id: "2", kind: "delete", retry: jest.fn() });
  expect(getFailures().map((failure) => failure.id)).toEqual(["1", "2"]);
  shiftFailure();
  expect(getFailures().map((failure) => failure.id)).toEqual(["2"]);
});

it("SHOULD generate distinct temporary ids with the pending prefix", () => {
  const a = newPendingId();
  const b = newPendingId();

  expect(a.startsWith("pending-")).toBe(true);
  expect(a).not.toBe(b);
});

it("SHOULD tell whether something is pending", () => {
  expect(hasPendingChanges([])).toBe(false);
  expect(hasPendingChanges([change])).toBe(true);
});
