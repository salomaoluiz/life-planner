import AccountDTO from "@application/dto/financial/AccountDTO";
import { AccountType } from "@domain/entities/financial/AccountEntity";

import {
  buildAccountEntries,
  filterByOwner,
  totalActiveCents,
  totalAmount,
  totalProjectedCents,
} from "./accountList";
import AccountUIModel from "./AccountUIModel";

function model(
  id: string,
  balance: number,
  status = "ACTIVE",
  ownerId = "user-id",
  type = AccountType.CHECKING,
) {
  return new AccountUIModel(
    new AccountDTO({
      balance,
      icon: "bank",
      id,
      name: id,
      owner: "USER",
      ownerId,
      status,
      type,
    }),
    [],
  );
}

const accounts = [
  model("b-active", 100),
  model("a-active", -30.5),
  model("archived", 999, "ARCHIVED"),
  model("family", 50, "ACTIVE", "family-1"),
];

it("SHOULD filter by owner and keep everything for ALL", () => {
  expect(filterByOwner(accounts, "ALL")).toHaveLength(4);
  expect(filterByOwner(accounts, "family-1").map((a) => a.id)).toEqual([
    "family",
  ]);
  expect(filterByOwner(accounts, "nobody")).toEqual([]);
});

it("SHOULD total only active accounts, including negative balances", () => {
  expect(totalActiveCents(accounts)).toBe(10000 - 3050 + 5000);
  expect(totalActiveCents([model("x", 5, "ARCHIVED")])).toBe(0);
  expect(totalActiveCents([])).toBe(0);
});

it("SHOULD format the total as amount parts", () => {
  expect(totalAmount(-3050)).toEqual({ type: "EXPENSE", value: 3050 });
  expect(totalAmount(4000)).toEqual({ value: 4000 });
});

it("SHOULD list the type section by name, then a collapsed Archived toggle", () => {
  const entries = buildAccountEntries(accounts, false);

  expect(entries.map((e) => e.kind)).toEqual([
    "typeSection",
    "row",
    "row",
    "row",
    "archivedToggle",
  ]);
  expect(entries[0]).toMatchObject({
    count: 3,
    subtotalCents: 10000 - 3050 + 5000,
    titleKey: "financial.accounts.types.CHECKING",
    type: AccountType.CHECKING,
  });
  expect(
    entries
      .map((e) => (e.kind === "row" ? e.account.id : undefined))
      .filter(Boolean),
  ).toEqual(["a-active", "b-active", "family"]);
  expect(entries[4]).toMatchObject({ count: 1, expanded: false });
});

it("SHOULD show archived rows WHEN expanded", () => {
  const entries = buildAccountEntries(accounts, true);

  expect(entries.map((e) => e.kind).slice(-2)).toEqual([
    "archivedToggle",
    "row",
  ]);
});

it("SHOULD omit empty groups", () => {
  expect(
    buildAccountEntries([model("only-archived", 1, "ARCHIVED")], false).map(
      (e) => e.kind,
    ),
  ).toEqual(["archivedToggle"]);
  expect(
    buildAccountEntries([model("only-active", 1)], false).map((e) => e.kind),
  ).toEqual(["typeSection", "row"]);
  expect(buildAccountEntries([], false)).toEqual([]);
});

it("SHOULD use unique keys", () => {
  const keys = buildAccountEntries(accounts, true).map((e) => e.key);

  expect(new Set(keys).size).toBe(keys.length);
});

function withProjection(
  id: string,
  balance: number,
  projected: number,
  status = "ACTIVE",
) {
  return new AccountUIModel(
    new AccountDTO({
      balance,
      icon: "bank",
      id,
      name: id,
      owner: "USER",
      ownerId: "user-id",
      projectedBalance: projected,
      status,
    }),
    [],
  );
}

it("SHOULD total the projected balance of the active accounts only", () => {
  expect(
    totalProjectedCents([
      withProjection("a", 100, 120),
      withProjection("b", 50, 20.5),
      withProjection("c", 999, 1, "ARCHIVED"),
    ]),
  ).toBe(14050);
  expect(totalProjectedCents([])).toBe(0);
});

it("SHOULD pin the favorite first in Active and keep the others by name (spec 094.2)", () => {
  const favorite = new AccountUIModel(
    new AccountDTO({
      balance: 1,
      icon: "bank",
      id: "z-favorite",
      isFavorite: true,
      name: "z-favorite",
      owner: "USER",
      ownerId: "user-id",
      status: "ACTIVE",
    }),
    [],
  );
  const ids = buildAccountEntries([...accounts, favorite], false)
    .map((e) => (e.kind === "row" ? e.account.id : undefined))
    .filter(Boolean);

  expect(ids).toEqual(["z-favorite", "a-active", "b-active", "family"]);
});

it("SHOULD NOT pin an archived favorite", () => {
  const archivedFavorite = new AccountUIModel(
    new AccountDTO({
      balance: 1,
      icon: "bank",
      id: "old",
      isFavorite: true,
      name: "old",
      owner: "USER",
      ownerId: "user-id",
      status: "ARCHIVED",
    }),
    [],
  );
  const ids = buildAccountEntries([...accounts, archivedFavorite], false)
    .map((e) => (e.kind === "row" ? e.account.id : undefined))
    .filter(Boolean);

  expect(ids).toEqual(["a-active", "b-active", "family"]);
});

describe("sections by type (spec 101)", () => {
  const typed = [
    model("cash", 10, "ACTIVE", "user-id", AccountType.CASH),
    model("broker-b", 200, "ACTIVE", "user-id", AccountType.BROKERAGE),
    model("broker-a", -50.25, "ACTIVE", "user-id", AccountType.BROKERAGE),
    model("check", 1),
    model("other", 5, "ACTIVE", "user-id", AccountType.OTHER),
    model("saving", 7, "ACTIVE", "user-id", AccountType.SAVINGS),
    model("old-broker", 999, "ARCHIVED", "user-id", AccountType.BROKERAGE),
  ];

  it("SHOULD emit the sections in the order Checking, Savings, Brokerage, Cash, Other", () => {
    const sections = buildAccountEntries(typed, false).flatMap((e) =>
      e.kind === "typeSection" ? [e.type] : [],
    );

    expect(sections).toEqual([
      AccountType.CHECKING,
      AccountType.SAVINGS,
      AccountType.BROKERAGE,
      AccountType.CASH,
      AccountType.OTHER,
    ]);
  });

  it("SHOULD hide a type without active accounts AND count and total only the active ones", () => {
    const entries = buildAccountEntries(
      [
        model("only-archived", 1, "ARCHIVED", "user-id", AccountType.CASH),
        ...typed.slice(1, 3),
      ],
      false,
    );
    const sections = entries.filter((e) => e.kind === "typeSection");

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      count: 2,
      key: "type-section-BROKERAGE",
      subtotalCents: 20000 - 5025,
      titleKey: "financial.accounts.types.BROKERAGE",
    });
  });

  it("SHOULD keep rows by name inside their section AND the archived group ungrouped", () => {
    const entries = buildAccountEntries(typed, true);
    const order = entries.map((e) => {
      if (e.kind === "row") {
        return e.account.id;
      }

      return e.kind === "typeSection" ? e.type : e.kind;
    });

    expect(order).toEqual([
      "CHECKING",
      "check",
      "SAVINGS",
      "saving",
      "BROKERAGE",
      "broker-a",
      "broker-b",
      "CASH",
      "cash",
      "OTHER",
      "other",
      "archivedToggle",
      "old-broker",
    ]);
  });

  it("SHOULD pin the favorite first inside its own section", () => {
    const favorite = new AccountUIModel(
      new AccountDTO({
        balance: 1,
        icon: "bank",
        id: "z-fav",
        isFavorite: true,
        name: "z-fav",
        owner: "USER",
        ownerId: "user-id",
        status: "ACTIVE",
        type: AccountType.BROKERAGE,
      }),
      [],
    );
    const ids = buildAccountEntries([...typed, favorite], false).flatMap((e) =>
      e.kind === "row" ? [e.account.id] : [],
    );

    expect(ids.slice(ids.indexOf("z-fav"), ids.indexOf("z-fav") + 3)).toEqual([
      "z-fav",
      "broker-a",
      "broker-b",
    ]);
  });
});
