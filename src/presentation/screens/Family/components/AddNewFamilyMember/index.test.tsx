import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/AddNewFamilyMember.mocks";

it("SHOULD render AddNewFamilyMember button", () => {
  setup();

  expect(screen.getByTestId("add-family-member-button")).toBeDefined();
});

it("SHOULD call onPress when button is pressed", () => {
  const onPress = jest.fn();
  setup({ onPress });

  const button = screen.getByTestId("add-family-member-button");
  button.props.onPress();

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render with correct label", () => {
  setup();

  const button = screen.getByTestId("add-family-member-button");
  expect(button.props.label).toBe("Add new Family Member");
});