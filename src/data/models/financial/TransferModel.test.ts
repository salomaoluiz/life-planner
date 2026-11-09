import TransferModel from "./TransferModel";

const item = {
  amountIn: 92000,
  amountOut: 500000,
  currencyIn: "USD",
  currencyOut: "BRL",
  dateIn: "2026-11-06",
  dateOut: "2026-11-04",
  description: "Send",
  fee: 350,
  fromAccountId: "acc-1",
  id: "transfer-1",
  notes: "note",
  occurrenceNumber: 2,
  paid: true,
  rate: { base: "IN", value: 5.4348 },
  recurrenceId: "series-1",
  toAccountId: "acc-2",
};

it("SHOULD map cents to decimal text, calendar days to ISO instants AND keep the series ids", () => {
  const model = TransferModel.fromJSON(item);

  expect(model).toMatchObject({
    amountIn: "920.00",
    amountOut: "5000.00",
    currencyIn: "USD",
    currencyOut: "BRL",
    fee: "3.50",
    fromAccountId: "acc-1",
    notes: "note",
    occurrenceNumber: 2,
    paid: true,
    rate: { base: "IN", value: 5.4348 },
    recurrenceId: "series-1",
    toAccountId: "acc-2",
  });
  expect(model.dateOut).toBe(new Date(2026, 10, 4).toISOString());
  expect(model.dateIn).toBe(new Date(2026, 10, 6).toISOString());
});

it("SHOULD leave the amount in, the fee AND the removed account empty WHEN the API sends null", () => {
  const model = TransferModel.fromJSON({
    ...item,
    amountIn: null,
    fee: null,
    fromAccountId: null,
    notes: null,
    paid: false,
    rate: undefined,
  });

  expect(model.amountIn).toBeUndefined();
  expect(model.fee).toBeUndefined();
  expect(model.fromAccountId).toBeUndefined();
  expect(model.paid).toBe(false);
});

it("SHOULD join the rows with the lookups", () => {
  const result = TransferModel.fromResponse({
    item,
    lookups: { categories: { c1: { name: "Transfer out" } }, tags: {} },
    rows: [
      {
        accountId: "acc-1",
        categoryId: "c1",
        currency: "BRL",
        date: "2026-11-04",
        description: "Send",
        id: "row-out",
        owner: "USER",
        ownerId: "o1",
        paid: true,
        type: "EXPENSE",
        value: 500000,
      },
    ],
  });

  expect(result.transfer.id).toBe("transfer-1");
  expect(result.rows[0]).toMatchObject({
    category: "Transfer out",
    id: "row-out",
  });
});
