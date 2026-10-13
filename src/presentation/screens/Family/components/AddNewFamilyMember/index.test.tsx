import { fireEvent, render, screen } from "@tests";

import AddNewFamilyMember from "./";

it("SHOULD show the given label AND call onPress WHEN the button is pressed", () => {
  const onPress = jest.fn();
  render(<AddNewFamilyMember label="Add" onPress={onPress} />);

  fireEvent.press(screen.UNSAFE_getAllByProps({ label: "Add" })[0]);

  expect(onPress).toHaveBeenCalledTimes(1);
});
