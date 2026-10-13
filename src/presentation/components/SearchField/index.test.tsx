import { fireEvent, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD show the placeholder and forward typing, without a label", () => {
  setup();
  const input = screen.getByTestId("search");
  fireEvent.changeText(input, "milk");
  expect(input.props.placeholder).toBe("Search");
  expect(input.props.accessibilityLabel).toBe("Search");
  expect(defaultProps.onChangeText).toHaveBeenCalledWith("milk");
});

it("SHOULD hide the clear button WHEN empty", () => {
  setup();
  expect(screen.queryByTestId("search-clear")).toBeNull();
});

it("SHOULD show the clear button WHEN not empty and clear on press", () => {
  setup({ value: "milk" });
  const clear = screen.getByTestId("search-clear");
  expect(clear.props.accessibilityLabel).toBe("Clear");
  fireEvent.press(clear);
  expect(defaultProps.onChangeText).toHaveBeenCalledWith("");
});
