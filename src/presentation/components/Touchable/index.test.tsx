import { Pressable, StyleSheet } from "react-native";

import { act, fireEvent, screen } from "@tests";

import { isWeb } from "@utils/platform";

import { defaultProps, flatStyle, setup } from "./mocks/index.mocks";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

it("SHOULD call onPress and onLongPress", () => {
  const onLongPress = jest.fn();
  const element = setup({ onLongPress });

  fireEvent.press(element);
  fireEvent(element, "longPress");

  expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  expect(onLongPress).toHaveBeenCalledTimes(1);
});

it("SHOULD expose role, label and state", () => {
  const element = setup({ selected: true });

  expect(element.props.accessibilityRole).toBe("button");
  expect(element.props.accessibilityLabel).toBe("Do it");
  expect(element.props.accessibilityState).toEqual(
    expect.objectContaining({ busy: false, disabled: false, selected: true }),
  );
});

it("SHOULD not be pressable and be dimmed WHEN disabled", () => {
  const element = setup({ disabled: true });

  fireEvent.press(element);

  expect(defaultProps.onPress).not.toHaveBeenCalled();
  expect(element.props.accessibilityState.disabled).toBe(true);
  expect(flatStyle(element).opacity).toBe(0.5);
});

it("SHOULD not be pressable and be busy WHEN busy", () => {
  const element = setup({ busy: true });

  fireEvent.press(element);

  expect(defaultProps.onPress).not.toHaveBeenCalled();
  expect(element.props.accessibilityState.busy).toBe(true);
});

it("SHOULD guarantee a 44x44 touch area by default", () => {
  const style = flatStyle(setup());

  expect(style.minHeight).toBe(44);
  expect(style.minWidth).toBe(44);
});

it("SHOULD skip the min size and use hitSlop WHEN minTouchTarget is false", () => {
  const element = setup({
    hitSlop: { bottom: 4, top: 4 },
    minTouchTarget: false,
  });

  expect(flatStyle(element).minHeight).toBeUndefined();
  expect(element.props.hitSlop).toEqual({ bottom: 4, top: 4 });
});

// RN's Pressable does not forward onFocus to the host view under jest (react-native-web does).
function pressable() {
  return screen.UNSAFE_getByType(Pressable);
}

describe("focus ring on web", () => {
  beforeEach(() => {
    jest.mocked(isWeb).mockReturnValue(true);
  });

  it("SHOULD show the ring WHEN focus is keyboard-initiated and hide it on blur", () => {
    setup();

    act(() => pressable().props.onFocus({ target: { matches: () => true } }));
    expect(screen.getByTestId("focus-ring")).toBeTruthy();
    act(() => pressable().props.onBlur());
    expect(screen.queryByTestId("focus-ring")).toBeNull();
  });

  it("SHOULD paint the ring with the given color", () => {
    setup({ focusRingColor: "#123456" });

    act(() => pressable().props.onFocus({ target: { matches: () => true } }));
    expect(
      StyleSheet.flatten(screen.getByTestId("focus-ring").props.style)
        .borderColor,
    ).toBe("#123456");
  });

  it("SHOULD NOT show the ring WHEN focus comes from a mouse click", () => {
    setup();

    act(() => pressable().props.onFocus({ target: { matches: () => false } }));
    expect(screen.queryByTestId("focus-ring")).toBeNull();
  });
});

it("SHOULD expose the testID as nativeID so Maestro web can select it by id", () => {
  const element = setup();

  expect(element.props.nativeID).toBe(element.props.testID);
  expect(element.props.nativeID).toBeTruthy();
});
