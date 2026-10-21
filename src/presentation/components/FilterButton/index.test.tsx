import { fireEvent, render, screen } from "@tests";

import { FilterButton } from "@components";

function setup(props: Partial<React.ComponentProps<typeof FilterButton>> = {}) {
  const onPress = jest.fn();

  render(
    <FilterButton
      accessibilityLabel={"Filters, 0 active"}
      count={0}
      label={"Filters"}
      onPress={onPress}
      testID={"filter-button"}
      {...props}
    />,
  );

  return { onPress };
}

it("SHOULD show the label without a badge when nothing is active, and call onPress", () => {
  const { onPress } = setup();

  expect(screen.getByText("Filters")).toBeOnTheScreen();
  expect(screen.queryByTestId("filter-button-badge")).toBeNull();
  fireEvent.press(screen.getByTestId("filter-button"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the number of active groups in a badge and name them for screen readers", () => {
  setup({ accessibilityLabel: "Filters, 3 active", count: 3 });

  expect(screen.getByTestId("filter-button-badge")).toHaveTextContent("3");
  expect(screen.getByLabelText("Filters, 3 active")).toBeOnTheScreen();
});

it("SHOULD hide the text but keep the badge WHEN iconOnly", () => {
  setup({ count: 2, iconOnly: true });

  expect(screen.queryByText("Filters")).toBeNull();
  expect(screen.getByTestId("filter-button-badge")).toBeOnTheScreen();
});
