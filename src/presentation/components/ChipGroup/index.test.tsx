import { fireEvent, screen } from "@tests";

import { onChange, setupMultiple, setupSingle } from "./mocks/index.mocks";

it("SHOULD select another option in single mode and ignore the already selected one", () => {
  setupSingle();
  fireEvent.press(screen.getByTestId("group-personal"));
  fireEvent.press(screen.getByTestId("group-all"));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith("personal");
  expect(
    screen.getByTestId("group-all").props.accessibilityState.selected,
  ).toBe(true);
});

it("SHOULD add and remove values in multiple mode", () => {
  setupMultiple(["all"]);
  fireEvent.press(screen.getByTestId("group-family"));
  expect(onChange).toHaveBeenLastCalledWith(["all", "family"]);
  fireEvent.press(screen.getByTestId("group-all"));
  expect(onChange).toHaveBeenLastCalledWith([]);
});

it("SHOULD not call onChange WHEN disabled", () => {
  setupSingle({ disabled: true });
  fireEvent.press(screen.getByTestId("group-personal"));
  expect(onChange).not.toHaveBeenCalled();
  expect(
    screen.getByTestId("group-personal").props.accessibilityState.disabled,
  ).toBe(true);
});

it("SHOULD render label and error through the field shell", () => {
  setupSingle({ error: "Pick one", label: "Owner" });
  expect(screen.getByTestId("group-label").props.children).toBe("Owner");
  expect(screen.getByTestId("group-error").props.children).toBe("Pick one");
});

it("SHOULD wrap by default and scroll horizontally WHEN layout is scroll", () => {
  setupSingle();
  expect(screen.queryByTestId("group-scroll")).toBeNull();
});

it("SHOULD render a horizontal scroll WHEN layout is scroll", () => {
  setupSingle({ layout: "scroll" });
  expect(screen.getByTestId("group-scroll").props.horizontal).toBe(true);
});
