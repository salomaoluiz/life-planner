import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render one chip per category and a More chip", () => {
  setup();

  expect(screen.getByText("Food")).toBeOnTheScreen();
  expect(screen.getByText("Rent")).toBeOnTheScreen();
  expect(screen.getByText("More")).toBeOnTheScreen();
});

it("SHOULD mark the selected category", () => {
  setup({ selected: "rent" });

  expect(screen.getByLabelText("Rent").props.accessibilityState).toEqual(
    expect.objectContaining({ selected: true }),
  );
  expect(screen.getByLabelText("Food").props.accessibilityState).toEqual(
    expect.objectContaining({ selected: false }),
  );
});

it("SHOULD call onSelect with the id and onMore", () => {
  const { onMore, onSelect } = setup();

  fireEvent.press(screen.getByText("Food"));
  fireEvent.press(screen.getByText("More"));

  expect(onSelect).toHaveBeenCalledWith("food");
  expect(onMore).toHaveBeenCalledTimes(1);
});

it("SHOULD show the error", () => {
  setup({ error: "Choose a category." });

  expect(screen.getByText("Choose a category.")).toBeOnTheScreen();
});
