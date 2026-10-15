import withAlpha from "./withAlpha";

it("SHOULD append the alpha channel as two hex digits", () => {
  expect(withAlpha("#6366F1", 1)).toBe("#6366F1ff");
  expect(withAlpha("#6366F1", 0)).toBe("#6366F100");
  expect(withAlpha("#6366F1", 0.16)).toBe("#6366F129");
});

it("SHOULD clamp the alpha AND leave non-hex values untouched", () => {
  expect(withAlpha("#6366F1", 5)).toBe("#6366F1ff");
  expect(withAlpha("blue", 0.5)).toBe("blue");
  expect(withAlpha("#123", 0.5)).toBe("#123");
});
