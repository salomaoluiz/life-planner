import { screen } from "@tests";

import { TextInputMode } from "./index";
import { defaultProps, setup } from "./mocks";

it("SHOULD pass the correct props for an Flat editable input", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual({
    children: undefined,
    mode: TextInputMode.Flat,
    onChangeText: defaultProps.onChangeText,
    style: expect.any(Object),
    testID: "test-text-input",
    value: "Default Value",
  });
});

it("SHOULD pass the correct props for an Outlined not editable input", () => {
  setup({ disabled: true, mode: TextInputMode.Outlined });

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual({
    children: undefined,
    disabled: true,
    mode: TextInputMode.Outlined,
    onChangeText: defaultProps.onChangeText,
    style: expect.any(Object),
    testID: "test-text-input",
    value: "Default Value",
  });
});

it("SHOULD have the correct style", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props.style).toEqual({
    minHeight: 48,
    width: "100%",
  });
});
