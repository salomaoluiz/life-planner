import CreditCardModel from "./CreditCardModel";
import CreditCardOverviewModel, {
  InvoiceModel,
} from "./CreditCardOverviewModel";
import { apiOverview } from "./mocks/CreditCard.mocks";

it("SHOULD map the aggregate, cards and invoices", () => {
  const model = CreditCardOverviewModel.fromJSON(apiOverview);

  expect(model.aggregate).toEqual({
    available: 500000,
    totalLimit: 500000,
    used: 0,
  });
  expect(model.cards[0].card).toBeInstanceOf(CreditCardModel);
  expect(model.cards[0].openInvoice).toBeInstanceOf(InvoiceModel);
  expect(model.cards[0].openInvoice.status).toBe("OPEN");
  expect(model.cards[0].closedInvoices[0].status).toBe("CLOSED");
  expect(model.cards[0].available).toBe(500000);
});

it("SHOULD build an empty overview", () => {
  expect(CreditCardOverviewModel.empty()).toEqual({
    aggregate: { available: 0, totalLimit: 0, used: 0 },
    cards: [],
  });
});
