import { fireEvent, render, screen } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makeInvoice, makeInvoiceDTO } from "../../mocks/invoice.mocks";
import CardInvoiceUIModel from "../../models/CardInvoiceUIModel";
import TransactionUIModel from "../../models/TransactionUIModel";
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

describe("projected purchases (spec 034 FR 14)", () => {
  function projected(id: string, value: string) {
    return new TransactionUIModel(
      new TransactionDTO({
        category: "Food",
        categoryId: "cat-1",
        creditCardId: "card-1",
        date: new Date(2026, 9, 28).toISOString(),
        description: "Streaming",
        id,
        isProjected: true,
        occurrenceCount: 12,
        occurrenceNumber: 2,
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
        value,
      }),
    );
  }

  it("SHOULD say the line includes projected purchases AND show the sum", () => {
    const props = {
      expanded: false,
      invoice: makeInvoice().withProjected([projected("p-1", "10.00")]),
      onOpen: jest.fn(),
      onPurchasePress: jest.fn(),
      onToggle: jest.fn(),
    };

    render(<CardInvoiceRow {...props} />);

    expect(
      screen.getByTestId(transactionsTestIds.cardInvoiceIncludesProjected),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.cardInvoiceAmount),
    ).toBeOnTheScreen();
  });

  it("SHOULD list the projected purchases WHEN expanded, open one through onProjectedPress AND still open the invoice", () => {
    const onProjectedPress = jest.fn();
    const onOpen = jest.fn();
    const item = projected("p-1", "10.00");

    render(
      <CardInvoiceRow
        expanded
        invoice={makeInvoice().withProjected([item])}
        onOpen={onOpen}
        onProjectedPress={onProjectedPress}
        onPurchasePress={jest.fn()}
        onToggle={jest.fn()}
      />,
    );

    fireEvent.press(
      screen.getByTestId(transactionsTestIds.cardInvoiceProjectedPurchase),
    );
    fireEvent.press(screen.getByTestId(transactionsTestIds.cardInvoiceOpen));

    expect(screen.getByText("Streaming 2/12")).toBeOnTheScreen();
    expect(onProjectedPress).toHaveBeenCalledWith(item);
    expect(onOpen).toHaveBeenCalled();
  });

  it("SHOULD not offer to open an invoice that only exists as a projection", () => {
    const only = new CardInvoiceUIModel(
      makeInvoiceDTO({ amount: 0, net: 0, total: 0 }, 0),
      [projected("p-1", "10.00")],
    );

    render(
      <CardInvoiceRow
        expanded
        invoice={only}
        onOpen={jest.fn()}
        onPurchasePress={jest.fn()}
        onToggle={jest.fn()}
      />,
    );

    expect(
      screen.queryByTestId(transactionsTestIds.cardInvoiceOpen),
    ).toBeNull();
  });

  it("SHOULD not press a projected purchase WHEN there is no handler", () => {
    render(
      <CardInvoiceRow
        expanded
        invoice={makeInvoice().withProjected([projected("p-1", "10.00")])}
        onOpen={jest.fn()}
        onPurchasePress={jest.fn()}
        onToggle={jest.fn()}
      />,
    );

    expect(() =>
      fireEvent.press(
        screen.getByTestId(transactionsTestIds.cardInvoiceProjectedPurchase),
      ),
    ).not.toThrow();
  });
});

describe("filtered invoice (spec 045)", () => {
  function filteredInvoice(matched: number, total: number, cents: number) {
    const dto = makeInvoiceDTO();

    dto.filtered = {
      filteredTotal: cents,
      matchedCount: matched,
      purchaseCount: total,
    };

    return new CardInvoiceUIModel(dto);
  }

  it("SHOULD show the matching sum as the amount and say how many purchases match", () => {
    render(
      <CardInvoiceRow
        expanded={false}
        invoice={filteredInvoice(1, 2, 12000)}
        onOpen={jest.fn()}
        onPurchasePress={jest.fn()}
        onToggle={jest.fn()}
      />,
    );

    expect(
      screen.getByTestId(transactionsTestIds.cardInvoiceMatch),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(/financial.transactions.filters.invoiceMatch/),
    ).toBeOnTheScreen();
  });

  it("SHOULD not say anything when every purchase matches", () => {
    render(
      <CardInvoiceRow
        expanded={false}
        invoice={filteredInvoice(2, 2, 45000)}
        onOpen={jest.fn()}
        onPurchasePress={jest.fn()}
        onToggle={jest.fn()}
      />,
    );

    expect(
      screen.queryByTestId(transactionsTestIds.cardInvoiceMatch),
    ).toBeNull();
  });
});
