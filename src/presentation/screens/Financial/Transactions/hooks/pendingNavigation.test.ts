import {
  consumePendingNavigation,
  setPendingNavigation,
} from "./pendingNavigation";

it("SHOULD hand the pending scope and type over once", () => {
  expect(consumePendingNavigation()).toBeUndefined();
  setPendingNavigation({ scope: "family-1", type: "EXPENSE" });
  expect(consumePendingNavigation()).toEqual({
    scope: "family-1",
    type: "EXPENSE",
  });
  expect(consumePendingNavigation()).toBeUndefined();
});
