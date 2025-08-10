import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the helper text with the correct props when visible", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props).toEqual({
    children: defaultProps.label,
    testID: defaultProps.testID,
    type: defaultProps.type,
  });
});

it("SHOULD not render when visible is false", () => {
  setup({ visible: false });

  const component = screen.queryByTestId(defaultProps.testID!);

  expect(component).toBeNull();
});

it("SHOULD render with error type", () => {
  setup({ type: "error" });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.type).toBe("error");
});

it("SHOULD render with info type", () => {
  setup({ type: "info" });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.type).toBe("info");
});

it("SHOULD render with custom label", () => {
  const customLabel = "Custom error message";
  setup({ label: customLabel });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.children).toBe(customLabel);
});

it("SHOULD not render when visible is undefined (falsy)", () => {
  setup({ visible: undefined });

  const component = screen.queryByTestId(defaultProps.testID!);

  expect(component).toBeNull();
});
