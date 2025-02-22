import { screen } from "@tests";
import { TextInputMode } from "./index";

import { defaultProps, setup } from "./mocks";

it("SHOULD pass the correct props for an Flat editable input", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual({
    mode: TextInputMode.Flat,
    testID: "test-text-input",
    value: "Default Value",
    onChangeText: defaultProps.onChangeText,
    style: expect.any(Object),
    children: undefined,
  });
});

it("SHOULD pass the correct props for an Outlined not editable input", () => {
  setup({ mode: TextInputMode.Outlined, disabled: true });

  const component = screen.getByTestId("test-text-input");

  expect(component.props).toEqual({
    mode: TextInputMode.Outlined,
    testID: "test-text-input",
    value: "Default Value",
    disabled: true,
    onChangeText: defaultProps.onChangeText,
    style: expect.any(Object),
    children: undefined,
  });
});

it("SHOULD have the correct style", () => {
  setup();

  const component = screen.getByTestId("test-text-input");

  expect(component.props.style).toEqual({});
});
