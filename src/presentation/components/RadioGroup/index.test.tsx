import { fireEvent, screen } from "@tests";

import { onChange, setup } from "./mocks/index.mocks";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD expose a radiogroup with the selected option checked", () => {
  setup();
  expect(screen.getByTestId("radio").props.accessibilityRole).toBe(
    "radiogroup",
  );
  expect(screen.getByTestId("radio").props.nativeID).toBe("radio");
  expect(
    screen.getByTestId("radio-ONLY_THIS").props.accessibilityState.selected,
  ).toBe(true);
  expect(
    screen.getByTestId("radio-THIS_AND_NEXT").props.accessibilityState.selected,
  ).toBe(false);
});

it("SHOULD call onChange for another option AND not for the selected one", () => {
  setup();
  fireEvent.press(screen.getByTestId("radio-ONLY_THIS"));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId("radio-THIS_AND_NEXT"));
  expect(onChange).toHaveBeenCalledWith("THIS_AND_NEXT");
});

it("SHOULD ignore a disabled option", () => {
  setup();
  fireEvent.press(screen.getByTestId("radio-ALL"));
  expect(onChange).not.toHaveBeenCalled();
});

it("SHOULD ignore every option WHEN the group is disabled", () => {
  setup("ONLY_THIS", true);
  fireEvent.press(screen.getByTestId("radio-THIS_AND_NEXT"));
  expect(onChange).not.toHaveBeenCalled();
});
