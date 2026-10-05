import { fireEvent, render, screen } from "@tests";

import NoticeSheet from "./index";

function setup(message?: string) {
  const onClose = jest.fn();

  render(
    <NoticeSheet
      closeLabel="Close"
      message={message}
      okLabel="OK"
      onClose={onClose}
      testID="notice"
      title="Oops"
      visible
    />,
  );

  return { onClose };
}

it("SHOULD call onClose WHEN OK is pressed", () => {
  const { onClose } = setup();

  fireEvent.press(screen.getByTestId("notice-ok"));

  expect(onClose).toHaveBeenCalledTimes(1);
});

it("SHOULD show the message only WHEN given", () => {
  setup("Remove the records first");

  expect(screen.getByText("Remove the records first")).toBeOnTheScreen();
});

it("SHOULD NOT show a message WHEN none is given", () => {
  setup();

  expect(screen.queryByText("Remove the records first")).toBeNull();
});
