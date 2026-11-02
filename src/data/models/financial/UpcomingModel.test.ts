import UpcomingModel from "./UpcomingModel";

const payload = {
  next: [
    {
      accountId: null,
      categoryId: null,
      creditCardId: "card-id",
      currency: "BRL",
      date: "2026-11-15",
      description: "Main card",
      id: "card-id:2026-11",
      invoiceMonth: "2026-11",
      kind: "INVOICE",
      occurrenceNumber: null,
      owner: "USER",
      ownerId: "owner-id",
      purchaseCount: 23,
      recurrenceId: null,
      type: "EXPENSE",
      valueCents: 185040,
    },
  ],
  nextTotal: 7,
  overdue: [],
  overdueTotals: { expenseCents: 317000, incomeCents: 0 },
};

it("SHOULD map every field of the API payload keeping cents", () => {
  const result = UpcomingModel.fromJSON(payload);

  expect(result.nextTotal).toBe(7);
  expect(result.overdueTotals).toEqual({
    expenseCents: 317000,
    incomeCents: 0,
  });
  expect(result.next[0]).toEqual(payload.next[0]);
});

it("SHOULD default missing lists and totals to empty", () => {
  expect(UpcomingModel.fromJSON({})).toEqual({
    next: [],
    nextTotal: 0,
    overdue: [],
    overdueTotals: { expenseCents: 0, incomeCents: 0 },
  });
});
