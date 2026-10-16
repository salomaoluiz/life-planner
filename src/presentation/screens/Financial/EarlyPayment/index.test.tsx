import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";
import earlyPaymentTestIds from "./testIds";

it("SHOULD title the sheet with the card AND show every field with Left to pay", () => {
  setup();

  expect(
    screen.getByText('financial.earlyPayment.titleCard {"card":"Main card"}'),
  ).toBeOnTheScreen();
  [
    earlyPaymentTestIds.invoice,
    earlyPaymentTestIds.leftToPay,
    earlyPaymentTestIds.amount,
    earlyPaymentTestIds.date,
    earlyPaymentTestIds.method,
    earlyPaymentTestIds.account,
    earlyPaymentTestIds.description,
    earlyPaymentTestIds.hint,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(screen.queryByTestId(earlyPaymentTestIds.delete)).toBeNull();
});

it("SHOULD prefill the default description AND save with it", () => {
  const vm = setup();

  expect(
    screen.getByDisplayValue("financial.earlyPayment.defaultDescription"),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(earlyPaymentTestIds.save));

  expect(vm.onSave).toHaveBeenCalledWith(
    "financial.earlyPayment.defaultDescription",
  );
});

it("SHOULD switch to a boleto from the segmented control", () => {
  const vm = setup();

  fireEvent.press(screen.getByText("financial.earlyPayment.boleto"));
  expect(vm.onMethodChange).toHaveBeenCalledWith("EXTERNAL");
});

it("SHOULD hide the account picker for a boleto AND explain when there is no active account", () => {
  setup({ method: "EXTERNAL" });
  expect(screen.queryByTestId(earlyPaymentTestIds.account)).toBeNull();

  setup({ accountOptions: [] });
  expect(
    screen.getByText("financial.earlyPayment.noAccounts"),
  ).toBeOnTheScreen();
});

it("SHOULD report the typed value and description", () => {
  const vm = setup({ description: "Boleto" });

  fireEvent.changeText(
    screen.getByTestId(earlyPaymentTestIds.description),
    "x",
  );

  expect(vm.onDescriptionChange).toHaveBeenCalledWith("x");
});

it("SHOULD show the form error", () => {
  setup({ formErrorKey: "financial.errors.overAmountDue" });

  expect(screen.getByTestId(earlyPaymentTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD lock the amount of a payment in a paid invoice AND hide the hint", () => {
  setup({ isEdit: true, isLocked: true });

  expect(screen.getByTestId(earlyPaymentTestIds.amount)).toBeOnTheScreen();
  expect(screen.queryByTestId(earlyPaymentTestIds.hint)).toBeNull();
});

it("SHOULD delete after the confirmation WHEN editing", () => {
  const vm = setup({ isDeleteOpen: true, isEdit: true });

  fireEvent.press(screen.getByTestId(earlyPaymentTestIds.delete));

  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
  expect(
    screen.getByText("financial.earlyPayment.deleteConfirm"),
  ).toBeOnTheScreen();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true });

  expect(screen.getByTestId("early-payment-skeleton")).toBeOnTheScreen();
});
