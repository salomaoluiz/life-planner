import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render the title and one row per category", () => {
  setup();

  expect(screen.getByText("Choose category")).toBeOnTheScreen();
  expect(screen.getByText("food")).toBeOnTheScreen();
  expect(screen.getByText("market")).toBeOnTheScreen();
  expect(screen.getByText("rent")).toBeOnTheScreen();
});

it("SHOULD indent children by depth", () => {
  setup();

  expect(
    screen.getByTestId("category-option-market-container").props.style,
  ).not.toEqual(
    screen.getByTestId("category-option-food-container").props.style,
  );
});

it("SHOULD filter rows by the search text", () => {
  setup({ query: "re" });

  expect(screen.getByText("rent")).toBeOnTheScreen();
  expect(screen.queryByText("food")).toBeNull();
});

it("SHOULD report search text changes", () => {
  const { onQueryChange } = setup();

  fireEvent.changeText(screen.getByPlaceholderText("Search"), "re");

  expect(onQueryChange).toHaveBeenCalledWith("re");
});

it("SHOULD call onSelect with the id", () => {
  const { onSelect } = setup();

  fireEvent.press(screen.getByText("rent"));

  expect(onSelect).toHaveBeenCalledWith("rent");
});

it("SHOULD show a check on the selected row only", () => {
  setup({ selected: "rent" });

  expect(screen.getByTestId("category-option-rent-selected")).toBeOnTheScreen();
  expect(screen.queryByTestId("category-option-food-selected")).toBeNull();
});
