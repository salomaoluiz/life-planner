import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/DeleteFamily.mocks";

it("SHOULD render DeleteFamily button", () => {
  setup();

  expect(screen.getByTestId("delete-family-button")).toBeDefined();
});

it("SHOULD call onPress when button is pressed", () => {
  const onPress = jest.fn();
  setup({ onPress });

  const button = screen.getByTestId("delete-family-button");
  button.props.onPress();

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render with correct label", () => {
  setup();

  const button = screen.getByTestId("delete-family-button");
  expect(button.props.label).toBe("Delete Family");
});

it("SHOULD render with error text color", () => {
  setup();

  const button = screen.getByTestId("delete-family-button");
  expect(button.props.customStyles.textColor).toBe("error");
});