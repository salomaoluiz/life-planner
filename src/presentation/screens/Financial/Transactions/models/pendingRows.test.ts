import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { makeInvoice } from "../mocks/invoice.mocks";
import { PendingChange } from "../pending/pendingChanges";
import {
  applyPendingToInvoices,
  applyPendingToItems,
  PendingContext,
} from "./pendingRows";
import TransactionUIModel from "./TransactionUIModel";

function dto(
  overrides: Partial<ConstructorParameters<typeof TransactionDTO>[0]> = {},
) {
  return new TransactionDTO({
    accountId: "acc-1",
    category: "Food",
    categoryId: "cat-1",
    date: new Date(2026, 9, 10).toISOString(),
    description: "Lunch",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "10.00",
    ...overrides,
  });
}

const context: PendingContext = {
  categoryById: new Map(),
  matches: (row) => new Date(row.date).getMonth() === 9,
};

function change(overrides: Partial<PendingChange>): PendingChange {
  return {
    description: "Lunch",
    id: "pending-1",
    kind: "create",
    ...overrides,
  };
}

const stored = new TransactionUIModel(dto());

it("SHOULD insert a created account row as saving, once", () => {
  const created = change({ row: dto({ description: "New", id: "pending-1" }) });
  const result = applyPendingToItems([stored], [created], context);

  expect(result).toHaveLength(2);
  expect(result[1].pendingState).toBe("saving");
  expect(result[1].description).toBe("New");
  expect(
    applyPendingToItems(result.slice(0, 1), [created], context),
  ).toHaveLength(2);
});

it("SHOULD ignore a created row that is out of the month or the filters", () => {
  const created = change({
    row: dto({ date: new Date(2026, 11, 10).toISOString(), id: "pending-1" }),
  });

  expect(applyPendingToItems([stored], [created], context)).toHaveLength(1);
});

it("SHOULD not double a created row once the server row is loaded", () => {
  const created = change({
    resolvedId: "tx-1",
    row: dto({ id: "pending-1" }),
  });

  expect(applyPendingToItems([stored], [created], context)).toHaveLength(1);
});

it("SHOULD replace an edited row in place as saving", () => {
  const edited = change({
    kind: "edit",
    previous: dto(),
    row: dto({ description: "Dinner", value: "20.00" }),
  });
  const result = applyPendingToItems([stored], [edited], context);

  expect(result).toHaveLength(1);
  expect(result[0].description).toBe("Dinner");
  expect(result[0].pendingState).toBe("saving");
});

it("SHOULD mark the original deleting when the edit leaves the month", () => {
  const edited = change({
    kind: "edit",
    previous: dto(),
    row: dto({ date: new Date(2026, 11, 1).toISOString() }),
  });
  const result = applyPendingToItems([stored], [edited], context);

  expect(result).toHaveLength(1);
  expect(result[0].pendingState).toBe("deleting");
  expect(result[0].description).toBe("Lunch");
});

it("SHOULD mark a deleted row as deleting without removing it", () => {
  const result = applyPendingToItems(
    [stored],
    [change({ kind: "delete", target: { transactionId: "tx-1" } })],
    context,
  );

  expect(result).toHaveLength(1);
  expect(result[0].pendingState).toBe("deleting");
});

describe("recurrence deletes", () => {
  const occurrences = [1, 2, 3].map(
    (n) =>
      new TransactionUIModel(
        dto({ id: `r-${n}`, occurrenceNumber: n, recurrenceId: "rec-1" }),
      ),
  );
  const other = new TransactionUIModel(
    dto({ id: "o-1", occurrenceNumber: 2, recurrenceId: "rec-2" }),
  );

  function states(scope: "ALL" | "ONLY_THIS" | "THIS_AND_NEXT") {
    return applyPendingToItems(
      [...occurrences, other],
      [
        change({
          kind: "delete",
          target: { fromOccurrence: 2, recurrenceId: "rec-1", scope },
        }),
      ],
      context,
    ).map((item) => item.pendingState);
  }

  it("SHOULD reach only the chosen occurrence", () => {
    expect(states("ONLY_THIS")).toEqual([
      undefined,
      "deleting",
      undefined,
      undefined,
    ]);
  });

  it("SHOULD reach the chosen occurrence and the next ones", () => {
    expect(states("THIS_AND_NEXT")).toEqual([
      undefined,
      "deleting",
      "deleting",
      undefined,
    ]);
  });

  it("SHOULD reach the whole series and nothing else", () => {
    expect(states("ALL")).toEqual([
      "deleting",
      "deleting",
      "deleting",
      undefined,
    ]);
  });
});

it("SHOULD not touch its inputs", () => {
  const items = [stored];

  applyPendingToItems(
    items,
    [change({ kind: "delete", target: { transactionId: "tx-1" } })],
    context,
  );
  expect(items[0].pendingState).toBeUndefined();
});

describe("card invoices", () => {
  it("SHOULD add a created card purchase to its invoice group", () => {
    const invoice = makeInvoice();
    const created = change({
      row: dto({
        accountId: undefined,
        creditCardId: "card-1",
        id: "pending-1",
        invoiceMonth: "2026-10",
      }),
    });
    const [result] = applyPendingToInvoices([invoice], [created], context);

    expect(result.purchases).toHaveLength(3);
    expect(result.purchases[2].pendingState).toBe("saving");
  });

  it("SHOULD skip a purchase of another invoice", () => {
    const invoice = makeInvoice();
    const created = change({
      row: dto({
        creditCardId: "card-1",
        id: "pending-1",
        invoiceMonth: "2026-11",
      }),
    });

    expect(applyPendingToInvoices([invoice], [created], context)[0]).toBe(
      invoice,
    );
  });

  it("SHOULD mark a deleted purchase as deleting inside its invoice", () => {
    const invoice = makeInvoice();
    const id = invoice.purchases[0].id;
    const [result] = applyPendingToInvoices(
      [invoice],
      [change({ kind: "delete", target: { transactionId: id } })],
      context,
    );

    expect(result.purchases[0].pendingState).toBe("deleting");
    expect(result.purchases[1].pendingState).toBeUndefined();
  });

  it("SHOULD replace an edited purchase as saving", () => {
    const invoice = makeInvoice();
    const id = invoice.purchases[0].id;
    const [result] = applyPendingToInvoices(
      [invoice],
      [
        change({
          kind: "edit",
          previous: dto({
            creditCardId: "card-1",
            id,
            invoiceMonth: "2026-10",
          }),
          row: dto({
            creditCardId: "card-1",
            description: "Changed",
            id,
            invoiceMonth: "2026-10",
          }),
        }),
      ],
      context,
    );

    expect(result.purchases[0]).toMatchObject({
      description: "Changed",
      pendingState: "saving",
    });
    expect(result.purchases).toHaveLength(2);
  });
});
