import { fireEvent, screen } from "@testing-library/react-native";
import * as ReactNative from "react-native";

import { getIndentPerLevel } from "./index";
import { setup } from "./mocks/index.mocks";

afterEach(() => {
  jest.restoreAllMocks();
});

it("SHOULD indent 24 per level on normal widths and 16 below 360", () => {
  expect(getIndentPerLevel(390)).toBe(24);
  expect(getIndentPerLevel(360)).toBe(24);
  expect(getIndentPerLevel(320)).toBe(16);
});

it("SHOULD not indent or draw a guide at depth 0", () => {
  setup({ depth: 0 });

  const style = JSON.stringify(
    screen.getByTestId("tree-item-container").props.style,
  );
  expect(style).not.toContain('"borderLeftWidth":1');
});

it("SHOULD indent by depth and draw the guide line at depth > 0", () => {
  jest.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
    fontScale: 1,
    height: 800,
    scale: 1,
    width: 390,
  });
  setup({ depth: 2 });

  const style = JSON.stringify(
    screen.getByTestId("tree-item-container").props.style,
  );
  expect(style).toContain('"marginLeft":48');
  expect(style).toContain('"borderLeftWidth":1');
});

it("SHOULD call onPress when the row is pressed", () => {
  const onPress = jest.fn();
  setup({ onPress });

  fireEvent.press(screen.getByTestId("tree-item"));

  expect(onPress).toHaveBeenCalledTimes(1);
});
