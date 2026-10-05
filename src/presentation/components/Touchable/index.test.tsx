import { fireEvent } from "@tests";

import { defaultProps, flatStyle, setup } from "./mocks/index.mocks";

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
