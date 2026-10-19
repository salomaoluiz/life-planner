import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { makeInvoice, makeInvoiceDTO } from "../mocks/invoice.mocks";
import CardInvoiceUIModel from "./CardInvoiceUIModel";
import TransactionUIModel from "./TransactionUIModel";

it("SHOULD expose the card, the amount and the list day (local, no time-zone shift)", () => {
  const invoice = makeInvoice();

  expect(invoice.id).toBe("card-1:2026-10");
  expect(invoice.cardTitle).toBe("Main card");
  expect(invoice.lastDigits).toBe("1234");
  expect(invoice.amountCents).toBe(45000);
  expect(invoice.signedCents).toBe(-45000);
  expect(invoice.listDate).toEqual(new Date(2026, 10, 5));
  expect(invoice.dateKey).toBe("2026-11-05");
  expect(invoice.referenceMonthDate).toEqual(new Date(2026, 9, 1));
});

it("SHOULD map the purchases with local dates, colors and a fallback icon", () => {
  const [market, fuel] = makeInvoice().purchases;

  expect(market).toMatchObject({
    amountCents: 25000,
    categoryIcon: "cart",
    date: new Date(2026, 9, 2),
    description: "Market",
  });
  expect(market.categoryColor).toBeDefined();
  expect(fuel.categoryIcon).toBe("help-circle-outline");
  expect(fuel.categoryColor).toBeUndefined();
  expect(market.installment).toBeUndefined();
  expect(fuel.installment).toEqual({ count: 10, number: 3 });
});

it("SHOULD describe how a paid invoice was paid", () => {
  const account = makeInvoice({
    payment: {
      accountId: "a",
      accountName: "Checking",
      amount: 45000,
      method: "ACCOUNT",
      paidOn: "2026-11-05",
    },
    status: "PAID",
  });
  const boleto = makeInvoice({
    payment: { amount: 45000, method: "EXTERNAL", paidOn: "2026-11-05" },
  });

  expect(account.paidAccountName).toBe("Checking");
  expect(account.paidExternal).toBe(false);
  expect(boleto.paidExternal).toBe(true);
  expect(makeInvoice().paidExternal).toBe(false);
});

it("SHOULD expose the status and the warning flag", () => {
  const invoice = makeInvoice({ paymentAfterDue: true });

  expect(invoice.status).toBe("CLOSED");
  expect(invoice.paymentAfterDue).toBe(true);
  expect(invoice.cardColor).toBe("#2B3A8C");
  expect(invoice.cardId).toBe("card-1");
  expect(invoice.ownerId).toBe("user-id");
});

describe("credits (spec 032)", () => {
  beforeEach(() => jest.setSystemTime(new Date(2026, 10, 1)));

  const refund = {
    date: "2026-10-16",
    description: "Refund · Notebook",
    id: "credit-1",
    kind: "REFUND" as const,
    refundedName: "Notebook",
    refundedTransactionId: "purchase-1",
    value: 50000,
  };

  it("SHOULD map the credits with a local date AND flag the prepaid purchases", () => {
    const invoice = makeInvoice({}, [refund]);

    expect(invoice.credits).toEqual([
      expect.objectContaining({
        amountCents: 50000,
        date: new Date(2026, 9, 16),
        id: "credit-1",
        kind: "REFUND",
        refundedName: "Notebook",
      }),
    ]);
    expect(invoice.purchases[0].prepaid).toBe(true);
    expect(invoice.purchases[1].prepaid).toBe(false);
  });

  it("SHOULD expose the carry-in, the early paid AND the credit carried to the next month", () => {
    const invoice = makeInvoice({
      amount: 0,
      carryIn: -200,
      earlyPaid: 600,
      total: -500,
    });

    expect(invoice.carryInCents).toBe(-200);
    expect(invoice.earlyPaidCents).toBe(600);
    expect(invoice.creditCarryCents).toBe(500);
    expect(invoice.creditCarryMonth).toBe("2026-11");
    expect(invoice.previousMonth).toBe("2026-09");
    expect(makeInvoice().creditCarryCents).toBe(0);
  });

  it("SHOULD allow new credits only WITHOUT a payment record AND once the period started", () => {
    expect(makeInvoice().canAddCredit).toBe(true);
    expect(makeInvoice({ periodStart: "2999-01-01" }).canAddCredit).toBe(false);
    expect(
      makeInvoice({
        payment: { amount: 1, method: "EXTERNAL", paidOn: "2026-11-05" },
      }).canAddCredit,
    ).toBe(false);
    expect(
      makeInvoice({
        payment: { amount: 1, method: "EXTERNAL", paidOn: "2026-11-05" },
      }).hasPayment,
    ).toBe(true);
  });
});

describe("projected purchases (spec 034 FR 14)", () => {
  function projected(value: string) {
    return new TransactionUIModel(
      new TransactionDTO({
        category: "Food",
        categoryId: "cat-1",
        creditCardId: "card-1",
        date: new Date(2026, 9, 28).toISOString(),
        description: "Streaming",
        id: `projected-${value}`,
        isProjected: true,
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
        value,
      }),
    );
  }

  it("SHOULD add the projected purchases to the line without moving the net of the day", () => {
    const invoice = makeInvoice().withProjected([
      projected("10.00"),
      projected("5.50"),
    ]);

    expect(invoice.includesProjected).toBe(true);
    expect(invoice.projectedCents).toBe(1550);
    expect(invoice.amountCents).toBe(46550);
    expect(invoice.signedCents).toBe(-45000);
    expect(invoice.isProjectedOnly).toBe(false);
    expect(invoice.canOpen).toBe(true);
  });

  it("SHOULD not include anything WHEN there are no projections", () => {
    const invoice = makeInvoice();

    expect(invoice.includesProjected).toBe(false);
    expect(invoice.projectedCents).toBe(0);
    expect(invoice.canOpen).toBe(true);
  });

  it("SHOULD not open an invoice that only exists as a projection", () => {
    const invoice = new CardInvoiceUIModel(
      makeInvoiceDTO({ amount: 0, net: 0, total: 0 }, 0),
      [projected("10.00")],
    );

    expect(invoice.isProjectedOnly).toBe(true);
    expect(invoice.canOpen).toBe(false);
    expect(invoice.amountCents).toBe(1000);
  });
});
