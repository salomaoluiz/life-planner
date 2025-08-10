import { act, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the accordion with correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component).toBeDefined();
  expect(component.props.testID).toBe(defaultProps.testID);
  expect(component.props.expanded).toBe(false);
});

it("SHOULD toggle expanded state when pressed", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  act(() => {
    component.props.onPress();
  });

  expect(component.props.expanded).toBe(true);
});

it("SHOULD call onPress callback when pressed", () => {
  const onPress = jest.fn();
  setup({ onPress });

  const component = screen.getByTestId(defaultProps.testID);

  act(() => {
    component.props.onPress();
  });

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onLongPress callback when long pressed", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  act(() => {
    component.props.onLongPress();
  });

  expect(defaultProps.onLongPress).toHaveBeenCalledTimes(1);
});

it("SHOULD call getAccordionStatus callback when expanded state changes", () => {
  const getAccordionStatus = jest.fn();
  setup({ getAccordionStatus });

  const component = screen.getByTestId(defaultProps.testID);

  act(() => {
    component.props.onPress();
  });

  expect(getAccordionStatus).toHaveBeenCalledWith(true);
});

it("SHOULD render with custom id when provided", () => {
  const customId = "custom-accordion-id";
  setup({ id: customId });

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props.id).toBe(customId);
});

it("SHOULD render content", () => {
  setup();

  expect(screen.getByTestId("accordion-content")).toBeDefined();
});