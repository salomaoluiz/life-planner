import { fireEvent, render, screen } from "@tests";

import SwitchRow from "./index";

it("SHOULD render the label AND the hint, and report the toggle", () => {
  const onToggle = jest.fn();

  render(
    <SwitchRow
      hint={"Future date"}
      label={"Paid"}
      onToggle={onToggle}
      testID={"paid"}
      value={false}
    />,
  );

  expect(screen.getByText("Paid")).toBeOnTheScreen();
  expect(screen.getByText("Future date")).toBeOnTheScreen();
  fireEvent(screen.getByTestId("paid"), "valueChange", true);
  expect(onToggle).toHaveBeenCalledWith(true);
});

it("SHOULD render no hint WHEN none is given", () => {
  render(<SwitchRow label={"Paid"} onToggle={jest.fn()} value />);

  expect(screen.queryByText("Future date")).toBeNull();
});
