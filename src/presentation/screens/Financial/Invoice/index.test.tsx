import { fireEvent, screen } from "@tests";

import { makeInvoice } from "../Transactions/mocks/invoice.mocks";
import { setup } from "./mocks/index.mocks";
import invoiceTestIds from "./testIds";

it("SHOULD show the amount, the status AND every purchase of a closed invoice", () => {
  setup();

  expect(screen.getByTestId(invoiceTestIds.amount)).toBeOnTheScreen();
  expect(
    screen.getByText("financial.cards.invoice.status.CLOSED"),
  ).toBeOnTheScreen();
  expect(screen.getAllByTestId(invoiceTestIds.purchase)).toHaveLength(2);
});

it("SHOULD offer Pay invoice ONLY on a closed invoice AND call onPayPress", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(invoiceTestIds.pay));

  expect(vm.onPayPress).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId(invoiceTestIds.undo)).toBeNull();
  expect(screen.queryByTestId(invoiceTestIds.addPurchase)).toBeNull();
});

it("SHOULD open the edit sheet of a purchase", () => {
  const vm = setup();

  fireEvent.press(screen.getAllByTestId(invoiceTestIds.purchase)[0]);

  expect(vm.onPurchasePress).toHaveBeenCalledWith("purchase-1");
});

it("SHOULD show how a paid invoice was paid AND offer Undo payment", () => {
  const vm = setup({
    invoice: makeInvoice({
      payment: {
        accountId: "a",
        accountName: "Checking",
        amount: 45000,
        method: "ACCOUNT",
        paidOn: "2026-11-05",
      },
      status: "PAID",
    }),
  });

  expect(screen.getByTestId(invoiceTestIds.paidInfo)).toBeOnTheScreen();
  expect(screen.queryByTestId(invoiceTestIds.pay)).toBeNull();
  fireEvent.press(screen.getByTestId(invoiceTestIds.undo));
  expect(vm.onUndoPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the boleto copy for an external payment", () => {
  setup({
    invoice: makeInvoice({
      payment: { amount: 45000, method: "EXTERNAL", paidOn: "2026-11-05" },
      status: "PAID",
    }),
  });

  expect(screen.getByTestId(invoiceTestIds.paidInfo)).toBeOnTheScreen();
});

it("SHOULD offer Add purchase on an open invoice", () => {
  const vm = setup({ invoice: makeInvoice({ status: "OPEN" }) });

  fireEvent.press(screen.getByTestId(invoiceTestIds.addPurchase));

  expect(vm.onAddPurchasePress).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId(invoiceTestIds.pay)).toBeNull();
});

it("SHOULD show a skeleton while loading AND an error with retry", () => {
  setup({ invoice: undefined });
  expect(screen.getByTestId("invoice-skeleton")).toBeOnTheScreen();
});

it("SHOULD show the error state with a retry", () => {
  const vm = setup({ errorMessage: "boom", invoice: undefined });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the pay sheet WHEN open: method, account, date AND confirm", () => {
  const vm = setup({ isPayOpen: true, isSubmitDisabled: false });

  expect(screen.getByTestId(invoiceTestIds.paySheet)).toBeOnTheScreen();
  expect(screen.getByTestId(invoiceTestIds.payAccount)).toBeOnTheScreen();
  expect(screen.getByTestId(invoiceTestIds.payDate)).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(invoiceTestIds.payConfirm));

  expect(vm.onPayConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the account picker for a boleto payment AND explain when there are no accounts", () => {
  setup({ isPayOpen: true, method: "EXTERNAL" });
  expect(screen.queryByTestId(invoiceTestIds.payAccount)).toBeNull();
});

it("SHOULD explain WHEN there is no active account AND show the payment error", () => {
  setup({
    accountOptions: [],
    formErrorKey: "financial.errors.invoiceNotPayable",
    isPayOpen: true,
  });

  expect(
    screen.getByText("financial.invoice.payment.noAccounts"),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(invoiceTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD call onMethodChange from the method control", () => {
  const vm = setup({ isPayOpen: true });

  fireEvent.press(screen.getByText("financial.invoice.payment.methodExternal"));

  expect(vm.onMethodChange).toHaveBeenCalledWith("EXTERNAL");
});

it("SHOULD show the undo confirmation dialog", () => {
  setup({
    invoice: makeInvoice({ status: "PAID" }),
    isUndoOpen: true,
  });

  expect(screen.getByText("financial.invoice.undoTitle")).toBeOnTheScreen();
});

it("SHOULD title an installment purchase with its number", () => {
  setup();

  expect(
    screen.getByText(
      'financial.installment.label {"description":"Fuel","k":3,"n":10}',
    ),
  ).toBeOnTheScreen();
  expect(screen.getByText("Market")).toBeOnTheScreen();
});
