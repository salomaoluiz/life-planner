import { isKeyboardFocus } from "./focusVisible";

it("SHOULD return true WHEN the target matches :focus-visible", () => {
  const target = { matches: jest.fn().mockReturnValue(true) };

  expect(isKeyboardFocus({ target })).toBe(true);
  expect(target.matches).toHaveBeenCalledWith(":focus-visible");
});

it("SHOULD return false WHEN the focus came from a mouse click", () => {
  expect(isKeyboardFocus({ target: { matches: () => false } })).toBe(false);
});

it("SHOULD read the target from nativeEvent too", () => {
  expect(
    isKeyboardFocus({ nativeEvent: { target: { matches: () => false } } }),
  ).toBe(false);
});

it("SHOULD return true WHEN matches is unavailable or throws", () => {
  expect(isKeyboardFocus({})).toBe(true);
  expect(
    isKeyboardFocus({
      target: {
        matches: () => {
          throw new Error("unsupported selector");
        },
      },
    }),
  ).toBe(true);
});
