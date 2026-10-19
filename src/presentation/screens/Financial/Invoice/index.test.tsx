import { fireEvent, screen } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";

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

describe("credits (spec 032)", () => {
  beforeEach(() => jest.setSystemTime(new Date(2026, 10, 1)));

  const credits = [
    {
      date: "2026-10-16",
      description: "Refund · Notebook",
      id: "credit-refund",
      kind: "REFUND" as const,
      refundedName: "Notebook",
      value: 50000,
    },
    {
      accountName: "Checking",
      date: "2026-10-16",
      description: "Early payment",
      id: "credit-early",
      kind: "EARLY_PAYMENT" as const,
      method: "ACCOUNT" as const,
      value: 60000,
    },
    {
      date: "2026-10-16",
      description: "Prepayment discount · Notebook",
      id: "credit-discount",
      kind: "PREPAYMENT_DISCOUNT" as const,
      value: 12000,
    },
  ];

  it("SHOULD list every credit with its title AND open a refund or an early payment", () => {
    const vm = setup({ invoice: makeInvoice({}, credits) });

    expect(screen.getAllByTestId(invoiceTestIds.credit)).toHaveLength(3);
    expect(
      screen.getByText(
        'financial.prepayment.discountLine {"description":"Notebook"}',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText("Checking")).toBeOnTheScreen();

    fireEvent.press(screen.getAllByTestId(invoiceTestIds.credit)[0]);
    fireEvent.press(screen.getAllByTestId(invoiceTestIds.credit)[1]);
    fireEvent.press(screen.getAllByTestId(invoiceTestIds.credit)[2]);

    expect(vm.onCreditPress).toHaveBeenCalledTimes(2);
    expect(vm.onCreditPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: "credit-refund" }),
    );
  });

  it("SHOULD name a boleto early payment AND a refund without purchase", () => {
    setup({
      invoice: makeInvoice({}, [
        { ...credits[1], accountName: undefined, method: "EXTERNAL" },
        { ...credits[0], refundedName: undefined },
      ]),
    });

    expect(screen.getByText("financial.earlyPayment.boleto")).toBeOnTheScreen();
  });

  it("SHOULD show the prepaid badge of a prepaid purchase", () => {
    setup();

    expect(screen.getAllByTestId(invoiceTestIds.prepaid)).toHaveLength(1);
  });

  it("SHOULD show Paid early AND Left to pay WHEN the invoice has early payments", () => {
    setup({ invoice: makeInvoice({ amount: 40000, earlyPaid: 60000 }) });

    expect(screen.getByTestId(invoiceTestIds.paidEarly)).toBeOnTheScreen();
    expect(screen.getByTestId(invoiceTestIds.leftToPay)).toBeOnTheScreen();
  });

  it("SHOULD show the carry text AND hide Pay AND Pay early WHEN the invoice is negative", () => {
    setup({
      invoice: makeInvoice({
        amount: 0,
        carryIn: -100,
        status: "PAID",
        total: -200,
      }),
    });

    expect(screen.getByTestId(invoiceTestIds.creditCarry)).toBeOnTheScreen();
    expect(screen.getByTestId(invoiceTestIds.carryIn)).toBeOnTheScreen();
    expect(screen.queryByTestId(invoiceTestIds.pay)).toBeNull();
    expect(screen.queryByTestId(invoiceTestIds.earlyPayment)).toBeNull();
    expect(screen.queryByTestId(invoiceTestIds.undo)).toBeNull();
    expect(screen.getByTestId(invoiceTestIds.refund)).toBeOnTheScreen();
  });

  it("SHOULD offer Refund AND Pay early on an invoice that can take credits", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId(invoiceTestIds.refund));
    fireEvent.press(screen.getByTestId(invoiceTestIds.earlyPayment));

    expect(vm.onRefundPress).toHaveBeenCalledTimes(1);
    expect(vm.onEarlyPaymentPress).toHaveBeenCalledTimes(1);
  });

  it("SHOULD offer neither on a paid or upcoming invoice", () => {
    setup({ invoice: makeInvoice({ periodStart: "2999-01-01" }) });

    expect(screen.queryByTestId(invoiceTestIds.refund)).toBeNull();
    expect(screen.queryByTestId(invoiceTestIds.earlyPayment)).toBeNull();
  });
});

describe("projected purchases (spec 034)", () => {
  const projected = new TransactionUIModel(
    new TransactionDTO({
      category: "Food",
      categoryId: "cat-1",
      creditCardId: "card-1",
      date: new Date(2026, 11, 28).toISOString(),
      description: "Streaming",
      id: "projected-series-1-3",
      isProjected: true,
      occurrenceCount: 12,
      occurrenceNumber: 3,
      owner: "USER",
      ownerId: "user-id",
      recurrenceId: "series-1",
      type: "EXPENSE",
      value: "20.00",
    }),
  );

  it("SHOULD list the projected purchases apart from the real ones AND open one", () => {
    const vm = setup({ projected: [projected] });

    expect(screen.getAllByTestId(invoiceTestIds.purchase)).toHaveLength(2);
    expect(screen.getByText("Streaming 3/12")).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(invoiceTestIds.projected));

    expect(vm.onProjectedPress).toHaveBeenCalledWith(projected);
  });

  it("SHOULD show no projected section WHEN there is nothing projected", () => {
    setup();

    expect(screen.queryByTestId(invoiceTestIds.projected)).toBeNull();
  });
});
