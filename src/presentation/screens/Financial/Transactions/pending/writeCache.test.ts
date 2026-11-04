import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { queryClient } from "@infrastructure/fetcher/reactQuery";

import { TransactionsData } from "../models/transactionsData";
import TransactionUIModel from "../models/TransactionUIModel";
import { PendingChange } from "./pendingChanges";
import { isPatchable, patchMonthLists, scopeOfChange } from "./writeCache";

jest.unmock("@tanstack/react-query");

function change(overrides: Partial<PendingChange>): PendingChange {
  return { description: "x", id: "pending-1", kind: "create", ...overrides };
}

function dto(id: string, overrides: Partial<TransactionDTO> = {}) {
  return new TransactionDTO({
    accountId: "account-1",
    category: "Food",
    categoryId: "category-1",
    date: "2026-10-10T12:00:00",
    description: id,
    id,
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
    value: "10.00",
    ...overrides,
  });
}

function idsOf(month: string, owners = ["owner-1"]) {
  return queryClient
    .getQueryData<TransactionsData>([
      ...financeKeys.transactions.list(month),
      ...owners,
    ])
    ?.items.map((item) => item.id);
}

function seed(month: string, ids: string[], owners = ["owner-1"]) {
  queryClient.setQueryData<TransactionsData>(
    [...financeKeys.transactions.list(month), ...owners],
    { items: ids.map((id) => new TransactionUIModel(dto(id))) },
  );
}

beforeEach(() => {
  queryClient.clear();
});

describe("patchMonthLists", () => {
  it("SHOULD remove only the deleted row", () => {
    seed("2026-10", ["a", "b"]);

    patchMonthLists(change({ kind: "delete", target: { transactionId: "a" } }));

    expect(idsOf("2026-10")).toEqual(["b"]);
  });

  it("SHOULD add a created row once, under the id the API gave, even if patched twice", () => {
    seed("2026-10", ["a"]);
    const created = change({ row: dto("pending-1") });

    patchMonthLists(created, "real-1");
    patchMonthLists(created, "real-1");

    expect(idsOf("2026-10")).toEqual(["a", "real-1"]);
  });

  it("SHOULD replace the row WHEN a refetch already brought it", () => {
    seed("2026-10", ["real-1"]);

    patchMonthLists(change({ row: dto("pending-1") }), "real-1");

    expect(idsOf("2026-10")).toEqual(["real-1"]);
  });

  it("SHOULD change nothing WHEN the month of the row is not cached", () => {
    seed("2026-10", ["a"]);

    patchMonthLists(
      change({ row: dto("pending-1", { date: "2026-12-05T12:00:00" }) }),
      "real-1",
    );

    expect(idsOf("2026-10")).toEqual(["a"]);
    expect(idsOf("2026-12")).toBeUndefined();
  });

  it("SHOULD NOT add the row to a month cached for other owners", () => {
    seed("2026-10", ["a"], ["owner-2"]);

    patchMonthLists(change({ row: dto("pending-1") }), "real-1");

    expect(idsOf("2026-10", ["owner-2"])).toEqual(["a"]);
  });

  it("SHOULD move an edited row to its new month", () => {
    seed("2026-10", ["a", "b"]);
    seed("2026-11", ["c"]);

    patchMonthLists(
      change({
        kind: "edit",
        previous: dto("a"),
        row: dto("a", { date: "2026-11-02T12:00:00" }),
      }),
    );

    expect(idsOf("2026-10")).toEqual(["b"]);
    expect(idsOf("2026-11")).toEqual(["c", "a"]);
  });

  it("SHOULD keep the position of a row edited inside its month", () => {
    seed("2026-10", ["a", "b"]);

    patchMonthLists(
      change({
        kind: "edit",
        previous: dto("a"),
        row: dto("a", { description: "new" }),
      }),
    );

    expect(idsOf("2026-10")).toEqual(["a", "b"]);
    expect(
      queryClient.getQueryData<TransactionsData>([
        ...financeKeys.transactions.list("2026-10"),
        "owner-1",
      ])?.items[0].description,
    ).toBe("new");
  });
});

describe("isPatchable", () => {
  it.each([
    ["a card purchase", { row: dto("a", { creditCardId: "card-1" }) }],
    ["a recurring row", { row: dto("a", { recurrenceId: "r1" }) }],
    ["an installment row", { row: dto("a", { installmentPlanId: "p1" }) }],
    [
      "a series delete",
      { kind: "delete" as const, target: { recurrenceId: "r1" } },
    ],
    [
      "a delete of a recurring row",
      {
        kind: "delete" as const,
        previous: dto("a", { recurrenceId: "r1" }),
        target: { transactionId: "a" },
      },
    ],
  ])("SHOULD be false for %s", (_label, overrides) => {
    expect(isPatchable(change(overrides))).toBe(false);
  });

  it("SHOULD be true for a plain account row", () => {
    expect(isPatchable(change({ row: dto("a") }))).toBe(true);
    expect(
      isPatchable(
        change({
          kind: "delete",
          previous: dto("a"),
          target: { transactionId: "a" },
        }),
      ),
    ).toBe(true);
  });
});

describe("scopeOfChange", () => {
  it("SHOULD scope an account row to its month, with no invoices and no projections", () => {
    expect(scopeOfChange(change({ row: dto("a") }))).toEqual({
      invoiceMonths: [],
      listMonths: ["2026-10"],
      projections: false,
    });
  });

  it("SHOULD scope a card purchase to its invoice month only", () => {
    expect(
      scopeOfChange(
        change({
          row: dto("a", { creditCardId: "card-1", invoiceMonth: "2026-11" }),
        }),
      ),
    ).toEqual({
      invoiceMonths: ["2026-11"],
      listMonths: [],
      projections: false,
    });
  });

  it("SHOULD scope an edit across months to both", () => {
    expect(
      scopeOfChange(
        change({
          kind: "edit",
          previous: dto("a"),
          row: dto("a", { date: "2026-11-02T12:00:00" }),
        }),
      ).listMonths,
    ).toEqual(["2026-11", "2026-10"]);
  });

  it("SHOULD scope a recurring row to every month and its projections", () => {
    expect(
      scopeOfChange(change({ row: dto("a", { recurrenceId: "r1" }) })),
    ).toEqual({ invoiceMonths: "all", listMonths: "all", projections: true });
  });

  it("SHOULD scope an installment row to every month but not the projections", () => {
    expect(
      scopeOfChange(change({ row: dto("a", { installmentPlanId: "p1" }) })),
    ).toEqual({ invoiceMonths: "all", listMonths: "all", projections: false });
  });
});
