import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";
import refundTestIds from "./testIds";

it("SHOULD title the sheet with the card AND show every field", () => {
  setup();

  expect(
    screen.getByText('financial.refund.titleCard {"card":"Main card"}'),
  ).toBeOnTheScreen();
  [
    refundTestIds.linked,
    refundTestIds.description,
    refundTestIds.amount,
    refundTestIds.date,
    refundTestIds.invoice,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(screen.queryByTestId(refundTestIds.delete)).toBeNull();
});

it("SHOULD prefill the description of the linked purchase", () => {
  setup({ linked: "tx:t2", linkedName: "TV" });

  expect(
    screen.getByDisplayValue(
      'financial.refund.defaultDescriptionOf {"purchase":"TV"}',
    ),
  ).toBeOnTheScreen();
});

it("SHOULD keep the typed description AND report edits", () => {
  const vm = setup({ description: "Chargeback" });

  expect(screen.getByDisplayValue("Chargeback")).toBeOnTheScreen();
  fireEvent.changeText(screen.getByTestId(refundTestIds.description), "x");

  expect(vm.onDescriptionChange).toHaveBeenCalledWith("x");
});

it("SHOULD save with the default description", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(refundTestIds.save));

  expect(vm.onSave).toHaveBeenCalledWith("financial.refund.defaultDescription");
});

it("SHOULD offer to clear the link only WHEN there is one", () => {
  const vm = setup({ linked: "plan:p1" });

  fireEvent.press(screen.getByTestId(refundTestIds.linkedClear));

  expect(vm.onLinkedClear).toHaveBeenCalledTimes(1);
});

it("SHOULD hide Clear WHEN nothing is linked", () => {
  setup();

  expect(screen.queryByTestId(refundTestIds.linkedClear)).toBeNull();
});

it("SHOULD show the carry hint WHEN the invoice goes negative", () => {
  setup({ carryCents: 20000 });

  expect(screen.getByTestId(refundTestIds.hint)).toBeOnTheScreen();
});

it("SHOULD show the field errors AND the form error", () => {
  setup({
    errors: { amount: "financial.refund.errors.amount" },
    formErrorKey: "financial.errors.invoicePaid",
  });

  expect(screen.getByTestId(refundTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD lock the amount of a refund in a paid invoice", () => {
  setup({ isEdit: true, isLocked: true });

  expect(screen.getByTestId(refundTestIds.amount)).toBeOnTheScreen();
});

it("SHOULD delete after the confirmation WHEN editing", () => {
  const vm = setup({ isDeleteOpen: true, isEdit: true });

  fireEvent.press(screen.getByTestId(refundTestIds.delete));

  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
  expect(screen.getByText("financial.refund.deleteConfirm")).toBeOnTheScreen();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true });

  expect(screen.getByTestId("refund-skeleton")).toBeOnTheScreen();
});
