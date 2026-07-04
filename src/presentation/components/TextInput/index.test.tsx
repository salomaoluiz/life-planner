import { screen } from "@tests";

import { TextInputMode } from "./index";
import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD pass the correct props for an Flat editable input", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual(
    expect.objectContaining({
      activeUnderlineColor: "transparent",
      children: undefined,
      mode: "flat",
      onBlur: expect.any(Function),
      onChangeText: defaultProps.onChangeText,
      onFocus: expect.any(Function),
      placeholderTextColor: "rgba(71, 85, 105, 0.65)",
      style: expect.any(Object),
      testID: "test-text-input",
      underlineColor: "transparent",
      value: "Default Value",
    }),
  );
});

it("SHOULD pass the correct props for an Outlined not editable input", () => {
  setup({ disabled: true, mode: TextInputMode.Outlined });

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual(
    expect.objectContaining({
      activeUnderlineColor: "transparent",
      children: undefined,
      disabled: true,
      mode: "flat",
      onBlur: expect.any(Function),
      onChangeText: defaultProps.onChangeText,
      onFocus: expect.any(Function),
      placeholderTextColor: "rgba(71, 85, 105, 0.65)",
      style: expect.any(Object),
      testID: "test-text-input",
      underlineColor: "transparent",
      value: "Default Value",
    }),
  );
});

it("SHOULD have the correct style", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props.style).toEqual({
    backgroundColor: "transparent",
    color: "rgb(15, 23, 42)",
    minHeight: 55,
    width: "100%",
  });
});
