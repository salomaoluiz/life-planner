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
