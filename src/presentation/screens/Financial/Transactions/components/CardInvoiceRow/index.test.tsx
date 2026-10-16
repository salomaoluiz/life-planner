import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makeInvoice } from "../../mocks/invoice.mocks";
import CardInvoiceRow from "./index";

function setup(
  overrides: Parameters<typeof makeInvoice>[0] = {},
  expanded = false,
) {
  const props = {
    expanded,
    invoice: makeInvoice(overrides),
    onOpen: jest.fn(),
    onPurchasePress: jest.fn(),
    onToggle: jest.fn(),
  };
  render(<CardInvoiceRow {...props} />);

  return props;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the card, the invoice month, the status and the amount while collapsed", () => {
  setup();

  expect(screen.getByText("Main card ••1234")).toBeOnTheScreen();
  expect(
    screen.getByText(/financial.transactions.cardInvoice.title/),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.cards.invoice.status.CLOSED"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.cardInvoiceAmount),
  ).toBeOnTheScreen();
  expect(
    screen.queryByTestId(transactionsTestIds.cardInvoicePurchase),
  ).not.toBeOnTheScreen();
});

it("SHOULD toggle with the invoice id WHEN the header is pressed", () => {
  const props = setup();

  fireEvent.press(screen.getByTestId(transactionsTestIds.cardInvoiceToggle));

  expect(props.onToggle).toHaveBeenCalledWith("card-1:2026-10");
});

it("SHOULD list every purchase WHEN expanded AND open the edit sheet of the pressed one", () => {
  const props = setup({}, true);

  expect(
    screen.getAllByTestId(transactionsTestIds.cardInvoicePurchase),
  ).toHaveLength(2);
  expect(screen.getByText("Market")).toBeOnTheScreen();
  fireEvent.press(
    screen.getAllByTestId(transactionsTestIds.cardInvoicePurchase)[1],
  );

  expect(props.onPurchasePress).toHaveBeenCalledWith("purchase-2");
});

it("SHOULD open the invoice detail from the expanded line", () => {
  const props = setup({}, true);

  fireEvent.press(screen.getByTestId(transactionsTestIds.cardInvoiceOpen));

  expect(props.onOpen).toHaveBeenCalledWith(props.invoice);
});

it("SHOULD show how a paid invoice was paid (account and boleto)", () => {
  setup({
    payment: {
      accountId: "a",
      accountName: "Checking",
      amount: 45000,
      method: "ACCOUNT",
      paidOn: "2026-11-05",
    },
    status: "PAID",
  });
  expect(
    screen.getByText(/financial.transactions.cardInvoice.paidWith.*Checking/),
  ).toBeOnTheScreen();
});

it("SHOULD show the boleto copy for an external payment AND the warning badge after due", () => {
  setup({
    payment: { amount: 45000, method: "EXTERNAL", paidOn: "2026-11-05" },
    paymentAfterDue: true,
    status: "PAID",
  });

  expect(
    screen.getByText("financial.transactions.cardInvoice.paidExternal"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.cards.invoice.paymentAfterDue"),
  ).toBeOnTheScreen();
});

it("SHOULD title an installment purchase with its number AND a plain one with the description", () => {
  setup({}, true);

  const titles = screen
    .getAllByTestId(`${transactionsTestIds.cardInvoicePurchase}-title`)
    .map((node) => node.props.children);

  expect(titles).toContain("Market");
  expect(titles).toContain(
    'financial.installment.label {"description":"Fuel","k":3,"n":10}',
  );
});
