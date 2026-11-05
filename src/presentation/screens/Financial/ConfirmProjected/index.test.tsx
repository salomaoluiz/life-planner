import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";
import confirmProjectedTestIds from "./testIds";

it("SHOULD title the sheet with the purchase AND show the projected item, the charge fields and the invoice caption", () => {
  setup();

  expect(
    screen.getByText(
      'financial.projected.confirm.title {"name":"Youtube Premium"}',
    ),
  ).toBeOnTheScreen();
  [
    confirmProjectedTestIds.item,
    confirmProjectedTestIds.amount,
    confirmProjectedTestIds.date,
    confirmProjectedTestIds.invoiceCaption,
    confirmProjectedTestIds.difference,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
});

it("SHOULD say the next occurrences stay projected WHEN the purchase belongs to a series", () => {
  setup();
  expect(screen.getByTestId(confirmProjectedTestIds.series)).toBeOnTheScreen();
});

it("SHOULD NOT mention a series for a one-off purchase", () => {
  setup({ isRecurring: false });
  expect(screen.queryByTestId(confirmProjectedTestIds.series)).toBeNull();
});

it("SHOULD hide the difference WHEN the charge equals the projection", () => {
  setup({ differenceCents: 0 });
  expect(screen.queryByTestId(confirmProjectedTestIds.difference)).toBeNull();
});

it("SHOULD confirm on the primary button", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(confirmProjectedTestIds.confirm));

  expect(vm.onConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD show the form error", () => {
  setup({ formErrorKey: "financial.errors.invoicePaid" });

  expect(
    screen.getByTestId(confirmProjectedTestIds.formError),
  ).toBeOnTheScreen();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true });

  expect(screen.queryByTestId(confirmProjectedTestIds.amount)).toBeNull();
});
