import { fireEvent, render, screen } from "@tests";

import ActionSheet from "./index";

function setup(visible = true) {
  const onAction = jest.fn();
  const onClose = jest.fn();

  render(
    <ActionSheet
      actionLabel="Delete"
      closeLabel="Close"
      onAction={onAction}
      onClose={onClose}
      subtitle="Family"
      testID="sheet"
      title="Options"
      visible={visible}
    />,
  );

  return { onAction, onClose };
}

it("SHOULD call onAction WHEN the destructive action is pressed", () => {
  const { onAction } = setup();

  fireEvent.press(screen.getByTestId("sheet-action"));

  expect(onAction).toHaveBeenCalledTimes(1);
});

it("SHOULD show the title and subtitle", () => {
  setup();

  expect(screen.getByText("Options")).toBeOnTheScreen();
  expect(screen.getByText("Family")).toBeOnTheScreen();
});

it("SHOULD NOT show the action WHEN hidden", () => {
  setup(false);

  expect(screen.queryByTestId("sheet-action")).toBeNull();
});
