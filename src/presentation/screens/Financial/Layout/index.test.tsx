import { fireEvent, screen } from "@tests";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD render the Finances title AND the 3 segments", () => {
  setup();

  expect(screen.getByText("navigation.tabs.finances")).toBeOnTheScreen();
  expect(screen.getByTestId("financial-segments")).toBeOnTheScreen();
  [
    "financial.sections.transactions",
    "financial.sections.categories",
    "financial.sections.accounts",
  ].forEach((label) => expect(screen.getByText(label)).toBeOnTheScreen());
});

it("SHOULD wrap the header, the segments and the stack in the Screen", () => {
  setup();

  expect(screen.getByTestId("financial-layout")).toBeOnTheScreen();
});

it("SHOULD select the segment that matches the current route", () => {
  setup("/financial/accounts");

  expect(
    screen.getByTestId("financial-segments-accounts").props.accessibilityState,
  ).toEqual(expect.objectContaining({ selected: true }));
});

it("SHOULD router.replace to the section path WHEN another segment is chosen", () => {
  setup("/financial");

  fireEvent.press(screen.getByText("financial.sections.categories"));

  expect(spies.replace).toHaveBeenCalledWith("/financial/categories");
});

it("SHOULD NOT navigate WHEN the selected segment is pressed again", () => {
  setup("/financial/categories");

  fireEvent.press(screen.getByText("financial.sections.categories"));

  expect(spies.replace).not.toHaveBeenCalled();
});
