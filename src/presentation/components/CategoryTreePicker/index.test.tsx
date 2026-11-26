import { fireEvent, screen } from "@tests";

import {
  onChange,
  onClose,
  onCreate,
  setupMultiple,
  setupSingle,
} from "./mocks/index.mocks";

it("SHOULD list the tree without archived nodes and mark the current value", () => {
  setupSingle();
  expect(screen.getByTestId("tree-option-food")).toBeTruthy();
  expect(screen.getByTestId("tree-option-veg")).toBeTruthy();
  expect(screen.queryByTestId("tree-option-old")).toBeNull();
  expect(screen.getByTestId("tree-option-home-selected")).toBeTruthy();
});

it("SHOULD select a parent and close WHEN a row is tapped", () => {
  setupSingle();
  fireEvent.press(screen.getByTestId("tree-option-food"));
  expect(onChange).toHaveBeenCalledWith("food");
  expect(onClose).toHaveBeenCalled();
});

it("SHOULD clear the value from the none row, hidden while searching", () => {
  setupSingle();
  fireEvent.press(screen.getByTestId("tree-none"));
  expect(onChange).toHaveBeenCalledWith(undefined);
  fireEvent.changeText(screen.getByTestId("tree-search"), "veg");
  expect(screen.queryByTestId("tree-none")).toBeNull();
});

it("SHOULD keep ancestors and siblings of a match and hide the rest", () => {
  setupSingle();
  fireEvent.changeText(screen.getByTestId("tree-search"), "market");
  expect(screen.getByTestId("tree-option-food")).toBeTruthy();
  expect(screen.getByTestId("tree-option-veg")).toBeTruthy();
  expect(screen.queryByTestId("tree-option-home")).toBeNull();
  expect(screen.getByTestId("tree-results")).toBeTruthy();
});

it("SHOULD offer to create from an empty search", () => {
  setupSingle();
  fireEvent.changeText(screen.getByTestId("tree-search"), "zzz");
  expect(screen.getByText("Nothing found")).toBeTruthy();
  fireEvent.press(screen.getByText("Create zzz"));
  expect(onCreate).toHaveBeenCalledWith("zzz");
});

it("SHOULD open the create modal from the end of the list", () => {
  setupSingle();
  fireEvent.press(screen.getByTestId("tree-create"));
  expect(onCreate).toHaveBeenCalledWith("");
});

it("SHOULD cover descendants WHEN a parent is ticked and ignore their taps", () => {
  setupMultiple();
  fireEvent.press(screen.getByTestId("tree-option-food"));
  expect(screen.getAllByText("Included in Food").length).toBeGreaterThan(0);
  fireEvent.press(screen.getByTestId("tree-option-market"));
  expect(screen.getByTestId("tree-apply")).toBeTruthy();
  fireEvent.press(screen.getByTestId("tree-apply"));
  expect(onChange).toHaveBeenCalledWith(["food"]);
  expect(onClose).toHaveBeenCalled();
});

it("SHOULD untick from the chip and clear everything", () => {
  setupMultiple(["home", "food"]);
  expect(screen.getByTestId("tree-chip-home")).toBeTruthy();
  fireEvent.press(screen.getByTestId("tree-chip-home-remove"));
  expect(screen.queryByTestId("tree-chip-home")).toBeNull();
  fireEvent.press(screen.getByTestId("tree-clear"));
  fireEvent.press(screen.getByTestId("tree-apply"));
  expect(onChange).toHaveBeenCalledWith([]);
});
