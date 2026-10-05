import AccountDTO from "@application/dto/financial/AccountDTO";

import {
  buildAccountEntries,
  filterByOwner,
  totalActiveCents,
  totalAmount,
} from "./accountList";
import AccountUIModel from "./AccountUIModel";

function model(
  id: string,
  balance: number,
  status = "ACTIVE",
  ownerId = "user-id",
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

it("SHOULD list the Active section by name, then a collapsed Archived toggle", () => {
  const entries = buildAccountEntries(accounts, false);

  expect(entries.map((e) => e.kind)).toEqual([
    "section",
    "row",
    "row",
    "row",
    "archivedToggle",
  ]);
  expect(entries[0]).toMatchObject({ titleKey: "financial.accounts.active" });
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
  ).toEqual(["section", "row"]);
  expect(buildAccountEntries([], false)).toEqual([]);
});

it("SHOULD use unique keys", () => {
  const keys = buildAccountEntries(accounts, true).map((e) => e.key);

  expect(new Set(keys).size).toBe(keys.length);
});
