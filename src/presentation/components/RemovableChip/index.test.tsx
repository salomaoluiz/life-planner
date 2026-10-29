import { fireEvent, render, screen } from "@tests";

import { RemovableChip } from "@components";

it("SHOULD show the text and remove through its x", () => {
  const onRemove = jest.fn();

  render(
    <RemovableChip
      label={"Tag: fixo"}
      onRemove={onRemove}
      removeLabel={"Remove Tag: fixo"}
      testID={"chip"}
    />,
  );

  expect(screen.getByText("Tag: fixo")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("chip-remove"));
  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Remove Tag: fixo")).toBeOnTheScreen();
});

it("SHOULD show a 10 px color bullet only when dotColor is given", () => {
  const props = { label: "Lazer", onRemove: jest.fn(), removeLabel: "Remove" };
  const { rerender } = render(
    <RemovableChip {...props} dotColor={"#112233"} testID={"chip"} />,
  );

  expect(
    screen.getByTestId("chip-dot", { includeHiddenElements: true }),
  ).toHaveStyle({
    backgroundColor: "#112233",
    height: 10,
    width: 10,
  });

  rerender(<RemovableChip {...props} testID={"chip"} />);
  expect(
    screen.queryByTestId("chip-dot", { includeHiddenElements: true }),
  ).toBeNull();
});
