import { act, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the accordion item with correct props", () => {
  setup();

  const component = screen.getByTestId("list-item");

  expect(component).toBeDefined();
  expect(component.props.id).toBe(defaultProps.id);
});

it("SHOULD call onPress when item is pressed", () => {
  setup();

  const component = screen.getByTestId("list-item");

  act(() => {
    component.props.onPress();
  });

  expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD be disabled when onPress is not provided", () => {
  setup({ onPress: undefined });

  const component = screen.getByTestId("list-item");

  expect(component.props.disabled).toBe(true);
});

it("SHOULD be enabled when onPress is provided", () => {
  setup();

  const component = screen.getByTestId("list-item");

  expect(component.props.disabled).toBe(false);
});

it("SHOULD render with title component", () => {
  setup();

  const component = screen.getByTestId("list-item");
  
  expect(component.props.title).toBeDefined();
  expect(typeof component.props.title).toBe("function");
});

it("SHOULD render with custom id", () => {
  const customId = "custom-item-id";
  setup({ id: customId });

  const component = screen.getByTestId("list-item");
  expect(component.props.id).toBe(customId);
});