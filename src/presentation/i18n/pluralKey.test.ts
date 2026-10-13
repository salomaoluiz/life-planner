import pluralKey from "./pluralKey";

it.each([
  [0, "x_other"],
  [1, "x_one"],
  [2, "x_other"],
])("SHOULD pick the right suffix for count %i", (count, expected) => {
  expect(pluralKey("x", count)).toBe(expected);
});
