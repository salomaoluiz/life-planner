import { expandNewFamilies, isExpanded } from "./expansion";

it("SHOULD expand the first family by default AND collapse the others", () => {
  expect(isExpanded({}, "a", "a")).toBe(true);
  expect(isExpanded({}, "b", "a")).toBe(false);
});

it("SHOULD let the user choice win over the default", () => {
  expect(isExpanded({ a: false }, "a", "a")).toBe(false);
  expect(isExpanded({ b: true }, "b", "a")).toBe(true);
});

it("SHOULD NOT touch the state WHEN nothing was seen yet (first load)", () => {
  const state = { a: false };

  expect(expandNewFamilies(state, [], ["a", "b"])).toBe(state);
});

it("SHOULD expand only the ids that were not seen before", () => {
  expect(expandNewFamilies({ a: false }, ["a"], ["a", "b"])).toEqual({
    a: false,
    b: true,
  });
});

it("SHOULD return the same state WHEN there is no new id (refetch on focus does not reset toggles)", () => {
  const state = { a: false };

  expect(expandNewFamilies(state, ["a", "b"], ["a", "b"])).toBe(state);
  expect(expandNewFamilies(state, ["a", "b"], ["a"])).toBe(state);
});
