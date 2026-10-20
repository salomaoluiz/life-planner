import { StyleSheet } from "react-native";

import { fireEvent, screen, within } from "@tests";

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

describe("wide layout (spec 037)", () => {
  const sheet = earlyPaymentTestIds.sheet;

  it("SHOULD be a form dialog with the fields split in two columns", () => {
    setup({ isEdit: true }, "expanded");

    expect(
      StyleSheet.flatten(screen.getByTestId(sheet).props.style).maxWidth,
    ).toBe(880);
    const left = within(screen.getByTestId(`${sheet}-column-left`));
    const right = within(screen.getByTestId(`${sheet}-column-right`));
    expect(left.getByTestId(earlyPaymentTestIds.invoice)).toBeOnTheScreen();
    expect(left.getByTestId(earlyPaymentTestIds.amount)).toBeOnTheScreen();
    expect(right.getByTestId(earlyPaymentTestIds.method)).toBeOnTheScreen();
    expect(
      right.getByTestId(earlyPaymentTestIds.description),
    ).toBeOnTheScreen();
  });

  it("SHOULD put Delete in the footer on wide and keep it in the body on compact", () => {
    setup({ isEdit: true }, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).getByTestId(
        earlyPaymentTestIds.delete,
      ),
    ).toBeOnTheScreen();
    screen.unmount();

    setup({ isEdit: true });
    expect(
      within(screen.getByTestId(`${sheet}-body`)).getByTestId(
        earlyPaymentTestIds.delete,
      ),
    ).toBeOnTheScreen();
  });
});
