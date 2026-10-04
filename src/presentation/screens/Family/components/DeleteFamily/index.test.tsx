import { fireEvent, render, screen } from "@tests";

import DeleteFamily from "./";

it("SHOULD call onPress WHEN the button is pressed", () => {
  const onPress = jest.fn();
  render(<DeleteFamily onPress={onPress} />);

  fireEvent.press(screen.UNSAFE_getAllByProps({ label: "Delete Family" })[0]);

  expect(onPress).toHaveBeenCalledTimes(1);
});
