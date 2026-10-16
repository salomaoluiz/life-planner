import TransactionDTO from "@application/dto/financial/TransactionDTO";

import {
  createLinkFields,
  linkedFromParams,
  linkedOptions,
  refundCarry,
  updateLinkFields,
  validate,
} from "./refundState";

function row(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]>,
) {
  return new TransactionDTO({
    category: "Food",
    categoryId: "cat-1",
    creditCardId: "card-1",
    date: "2026-10-01T00:00:00.000Z",
    description: "x",
    id: "t",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "10.00",
    ...overrides,
  });
}

it("SHOULD list the purchases of the card AND one entry per installment plan, newest first", () => {
  const rows = [
    row({ date: "2026-10-01T00:00:00.000Z", description: "Market", id: "t1" }),
    row({ date: "2026-10-05T00:00:00.000Z", description: "TV", id: "t2" }),
    row({
      date: "2026-10-03T00:00:00.000Z",
      description: "Notebook",
      id: "i1",
      installmentNumber: 1,
      installmentPlanId: "plan-1",
    }),
    row({
      date: "2026-10-03T00:00:00.000Z",
      description: "Notebook",
      id: "i2",
      installmentNumber: 2,
      installmentPlanId: "plan-1",
    }),
    row({ creditCardId: "other", description: "Other card", id: "t3" }),
    row({ description: "Refund", id: "t4", systemKey: "CARD_REFUND" }),
    row({ description: "Salary", id: "t5", type: "INCOME" }),
  ];

  expect(linkedOptions(rows, "card-1")).toEqual([
    { isPlan: false, name: "TV", value: "tx:t2" },
    { isPlan: true, name: "Notebook", value: "plan:plan-1" },
    { isPlan: false, name: "Market", value: "tx:t1" },
  ]);
});

it("SHOULD turn the link into the API fields (null removes it on update)", () => {
  expect(createLinkFields("tx:t1")).toEqual({
    refundedPlanId: undefined,
    refundedTransactionId: "t1",
  });
  expect(createLinkFields("plan:p1")).toEqual({
    refundedPlanId: "p1",
    refundedTransactionId: undefined,
  });
  expect(createLinkFields(undefined)).toEqual({
    refundedPlanId: undefined,
    refundedTransactionId: undefined,
  });
  expect(updateLinkFields(undefined)).toEqual({
    refundedPlanId: null,
    refundedTransactionId: null,
  });
  expect(updateLinkFields("tx:t1")).toEqual({
    refundedPlanId: null,
    refundedTransactionId: "t1",
  });
  expect(updateLinkFields("plan:p1")).toEqual({
    refundedPlanId: "p1",
    refundedTransactionId: null,
  });
});

it("SHOULD read the link from the route params", () => {
  expect(linkedFromParams({ refundedPlanId: "p1" })).toBe("plan:p1");
  expect(linkedFromParams({ refundedTransactionId: "t1" })).toBe("tx:t1");
  expect(linkedFromParams({})).toBeUndefined();
});

it("SHOULD compute the credit that stays on the invoice (500 refund on a 300 invoice = 200)", () => {
  expect(refundCarry(300, 500)).toBe(200);
  expect(refundCarry(500, 500)).toBe(0);
  expect(refundCarry(-100, 50)).toBe(150);
  // Editing: the 300 total already includes the 200 being edited, so the base is 500.
  expect(refundCarry(300, 500, 200)).toBe(0);
});

it("SHOULD require a value, a description AND an invoice", () => {
  const ok = { amountCents: 100, date: new Date(), invoiceMonth: "2026-10" };

  expect(validate(ok, "Refund")).toEqual({});
  expect(validate({ ...ok, amountCents: 0 }, "Refund").amount).toBe(
    "financial.refund.errors.amount",
  );
  expect(validate(ok, "  ").description).toBe(
    "financial.refund.errors.description",
  );
  expect(validate({ ...ok, invoiceMonth: undefined }, "Refund").invoice).toBe(
    "financial.refund.errors.invoice",
  );
});
