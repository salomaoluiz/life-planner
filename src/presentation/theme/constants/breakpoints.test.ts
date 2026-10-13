import { breakpoints, getBreakpoint } from "./breakpoints";

it("SHOULD expose the min widths", () => {
  expect(breakpoints).toEqual({ compact: 0, expanded: 1024, medium: 768 });
});

it.each([
  [0, "compact"],
  [390, "compact"],
  [767, "compact"],
  [768, "medium"],
  [800, "medium"],
  [1023, "medium"],
  [1024, "expanded"],
  [1280, "expanded"],
] as const)("SHOULD map width %s to %s", (width, expected) => {
  expect(getBreakpoint(width)).toBe(expected);
});
