import { fireEvent, render, screen } from "@tests";

import IconPickerSheet from "./";

function setup(query = "") {
  const props = {
    closeLabel: "Close",
    color: "#123456",
    icons: [
      { label: "Car", value: "car" },
      { label: "Heart", value: "heart" },
    ],
    onClose: jest.fn(),
    onQueryChange: jest.fn(),
    onSelect: jest.fn(),
    query,
    searchPlaceholder: "Search",
    selected: "car",
    title: "Choose icon",
  };
  render(<IconPickerSheet {...props} />);

  return props;
}

it("SHOULD render the title, the icons and no More tile", () => {
  setup();

  expect(screen.getAllByText("Choose icon").length).toBeGreaterThan(0);
  expect(screen.getByTestId("icon-picker-icon-car")).toBeOnTheScreen();
  expect(screen.getByTestId("icon-picker-icon-heart")).toBeOnTheScreen();
  expect(screen.queryByTestId("icon-picker-more")).toBeNull();
});

it("SHOULD report search text changes", () => {
  const props = setup();

  fireEvent.changeText(screen.getByPlaceholderText("Search"), "he");

  expect(props.onQueryChange).toHaveBeenCalledWith("he");
});

it("SHOULD call onSelect with the icon name", () => {
  const props = setup();

  fireEvent.press(screen.getByTestId("icon-picker-icon-heart"));

  expect(props.onSelect).toHaveBeenCalledWith("heart");
});
