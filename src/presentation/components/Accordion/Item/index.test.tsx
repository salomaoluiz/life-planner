import { List } from "react-native-paper";

import { fireEvent, hasText, mocks, screen, setup } from "./mocks/index.mocks";

it("SHOULD render the title, left and right elements", () => {
  setup();

  expect(hasText("Item title")).toBe(true);
  expect(screen.getByTestId("item-left")).toBeOnTheScreen();
  expect(screen.getByTestId("item-right")).toBeOnTheScreen();
});

it("SHOULD be enabled and call onPress WHEN pressed", () => {
  setup();
  const item = screen.UNSAFE_getByType(List.Item);

  fireEvent.press(item);

  expect(item.props.disabled).toBe(false);
  expect(mocks.defaultProps.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD be disabled WHEN there is no onPress", () => {
  setup({ onPress: undefined });

  expect(screen.UNSAFE_getByType(List.Item).props.disabled).toBe(true);
});

it("SHOULD render without left and right elements", () => {
  setup({ left: undefined, right: undefined });

  expect(hasText("Item title")).toBe(true);
  expect(screen.queryByTestId("item-left")).not.toBeOnTheScreen();
});
