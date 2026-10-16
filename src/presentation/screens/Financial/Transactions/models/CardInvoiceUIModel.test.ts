import { makeInvoice } from "../mocks/invoice.mocks";

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
