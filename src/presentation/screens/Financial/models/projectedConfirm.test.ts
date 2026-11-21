import type { InvoicePurchaseUIModel } from "@screens/Financial/Transactions/models/CardInvoiceUIModel";

import { projectedConfirmParams } from "./projectedConfirm";

function purchase(
  overrides: Partial<InvoicePurchaseUIModel> = {},
): InvoicePurchaseUIModel {
  return {
    amountCents: 10000,
    categoryIcon: "x",
    categoryName: "Subscriptions",
    date: new Date(2026, 9, 25),
    description: "Youtube Premium",
    id: "p9",
    prepaid: false,
    projected: true,
    ...overrides,
  };
}

it("SHOULD build the confirm params with the local calendar date and the cents as text", () => {
  expect(projectedConfirmParams("card-1", purchase())).toEqual({
    creditCardId: "card-1",
    date: "2026-10-25",
    description: "Youtube Premium",
    id: "p9",
    recurring: undefined,
    value: "10000",
  });
});

it("SHOULD flag a purchase of a series as recurring", () => {
  expect(
    projectedConfirmParams("card-1", purchase({ recurrenceId: "series-1" })),
  ).toMatchObject({ recurring: "1" });
});
