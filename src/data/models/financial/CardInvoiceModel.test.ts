import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import {
  apiCardInvoice,
  apiPayment,
} from "@data/models/financial/mocks/CardInvoice.mocks";
import { apiOverview } from "@data/models/financial/mocks/CreditCard.mocks";

it("SHOULD map the card, the invoice and the purchases (cents kept)", () => {
  const model = CardInvoiceModel.fromJSON(apiCardInvoice);

  expect(model.card).toMatchObject({ lastDigits: "1234", title: "Main card" });
  expect(model.invoice).toMatchObject({
    amount: 45000,
    listDate: "2026-11-05",
    payment: undefined,
    status: "CLOSED",
  });
  expect(model.purchases[0]).toMatchObject({ category: "Food", value: 25000 });
});

it("SHOULD map the payment of a paid invoice (account and boleto)", () => {
  const paid = CardInvoiceModel.fromJSON({
    ...apiCardInvoice,
    invoice: { ...apiCardInvoice.invoice, payment: apiPayment, status: "PAID" },
  });
  const external = CardInvoiceModel.fromJSON({
    ...apiCardInvoice,
    invoice: {
      ...apiCardInvoice.invoice,
      payment: {
        ...apiPayment,
        accountId: null,
        accountName: null,
        method: "EXTERNAL",
      },
    },
  });

  expect(paid.invoice.payment).toEqual({ ...apiPayment });
  expect(external.invoice.payment).toMatchObject({
    accountId: undefined,
    method: "EXTERNAL",
  });
});

it("SHOULD default purchases to [] AND listDate to the payment date", () => {
  const model = CardInvoiceModel.fromJSON({
    ...apiCardInvoice,
    invoice: { ...apiCardInvoice.invoice, listDate: undefined },
    purchases: undefined,
  });

  expect(model.purchases).toEqual([]);
  expect(model.invoice.listDate).toBe(model.invoice.paymentDate);
});

it("SHOULD map the upcoming invoices of the overview (and tolerate old payloads without them)", () => {
  const withUpcoming = CreditCardOverviewModel.fromJSON({
    ...apiOverview,
    cards: [
      {
        ...apiOverview.cards[0],
        upcomingInvoices: [
          { ...apiOverview.cards[0].openInvoice, referenceMonth: "2026-12" },
        ],
      },
    ],
  });
  const old = CreditCardOverviewModel.fromJSON({
    ...apiOverview,
    cards: [{ ...apiOverview.cards[0], upcomingInvoices: undefined }],
  });

  expect(withUpcoming.cards[0].upcomingInvoices[0].referenceMonth).toBe(
    "2026-12",
  );
  expect(old.cards[0].upcomingInvoices).toEqual([]);
});

describe("card credits (spec 032)", () => {
  const credit = {
    accountId: "acc-1",
    accountName: "Checking",
    date: "2026-10-16",
    description: "Early payment",
    id: "credit-1",
    kind: "EARLY_PAYMENT",
    method: "ACCOUNT",
    refundedName: null,
    refundedPlanId: null,
    refundedTransactionId: null,
    value: 60000,
  };

  it("SHOULD map the credits (nulls become undefined) AND the prepaid flag", () => {
    const model = CardInvoiceModel.fromJSON({
      ...apiCardInvoice,
      credits: [credit],
      purchases: [{ ...apiCardInvoice.purchases[0], prepaid: true }],
    });

    expect(model.credits).toEqual([
      {
        accountId: "acc-1",
        accountName: "Checking",
        date: "2026-10-16",
        description: "Early payment",
        id: "credit-1",
        kind: "EARLY_PAYMENT",
        method: "ACCOUNT",
        refundedName: undefined,
        refundedPlanId: undefined,
        refundedTransactionId: undefined,
        value: 60000,
      },
    ]);
    expect(model.purchases[0].prepaid).toBe(true);
  });

  it("SHOULD default to no credits, not prepaid AND the old amount as due/net/total", () => {
    const model = CardInvoiceModel.fromJSON(apiCardInvoice);

    expect(model.credits).toEqual([]);
    expect(model.purchases[0].prepaid).toBe(false);
    expect(model.invoice).toMatchObject({
      amountDue: 45000,
      carryIn: 0,
      earlyPaid: 0,
      net: 45000,
      total: 45000,
    });
  });

  it("SHOULD read the invoice credit fields WHEN the API sends them", () => {
    const model = CardInvoiceModel.fromJSON({
      ...apiCardInvoice,
      invoice: {
        ...apiCardInvoice.invoice,
        amount: 0,
        amountDue: 0,
        carryIn: -200,
        earlyPaid: 600,
        net: -100,
        total: -300,
      },
    });

    expect(model.invoice).toMatchObject({
      amountDue: 0,
      carryIn: -200,
      earlyPaid: 600,
      net: -100,
      total: -300,
    });
  });
});

it("SHOULD read the notes of a purchase, null meaning none (spec 059)", () => {
  const purchase = apiCardInvoice.purchases[0];
  const model = CardInvoiceModel.fromJSON({
    ...apiCardInvoice,
    purchases: [
      { ...purchase, notes: "Presente" },
      { ...purchase, id: "p-2", notes: null },
    ],
  });

  expect(model.purchases[0].notes).toBe("Presente");
  expect(model.purchases[1].notes).toBeUndefined();
});
