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
