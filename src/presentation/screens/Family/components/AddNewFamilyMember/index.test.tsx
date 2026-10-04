import { fireEvent, render, screen } from "@tests";

import AddNewFamilyMember from "./";

it("SHOULD call onPress WHEN the button is pressed", () => {
  const onPress = jest.fn();
  render(<AddNewFamilyMember onPress={onPress} />);

  fireEvent.press(
    screen.UNSAFE_getAllByProps({ label: "Add new Family Member" })[0],
  );

  expect(onPress).toHaveBeenCalledTimes(1);
});
