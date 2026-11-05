import CreditCardModel from "./CreditCardModel";
import CreditCardOverviewModel, {
  InvoiceModel,
} from "./CreditCardOverviewModel";
import { apiOverview } from "./mocks/CreditCard.mocks";

it("SHOULD map the aggregate, cards and invoices", () => {
  const model = CreditCardOverviewModel.fromJSON(apiOverview);

  expect(model.aggregate).toEqual({
    available: 500000,
    projectedUsed: 0,
    totalLimit: 500000,
    used: 0,
  });
  expect(model.cards[0].card).toBeInstanceOf(CreditCardModel);
  expect(model.cards[0].openInvoice).toBeInstanceOf(InvoiceModel);
  expect(model.cards[0].openInvoice.status).toBe("OPEN");
  expect(model.cards[0].closedInvoices[0].status).toBe("CLOSED");
  expect(model.cards[0].available).toBe(500000);
});

it("SHOULD read projectedUsed per card and in the aggregate, defaulting to 0 (spec 096)", () => {
  const model = CreditCardOverviewModel.fromJSON({
    ...apiOverview,
    aggregate: { ...apiOverview.aggregate, projectedUsed: 1200 },
    cards: [{ ...apiOverview.cards[0], projectedUsed: 700 }],
  });

  expect(model.aggregate.projectedUsed).toBe(1200);
  expect(model.cards[0].projectedUsed).toBe(700);
  expect(
    CreditCardOverviewModel.fromJSON(apiOverview).cards[0].projectedUsed,
  ).toBe(0);
});

it("SHOULD build an empty overview", () => {
  expect(CreditCardOverviewModel.empty()).toEqual({
    aggregate: { available: 0, projectedUsed: 0, totalLimit: 0, used: 0 },
    cards: [],
  });
});
