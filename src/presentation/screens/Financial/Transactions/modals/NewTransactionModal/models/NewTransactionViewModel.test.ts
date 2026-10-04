import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { accounts, categories, owners } from "../../../mocks/index.mocks";
import NewTransactionViewModel from "./NewTransactionViewModel";

function setup() {
  return new NewTransactionViewModel({
    accountsDTO: accounts,
    categoriesDTO: categories,
    ownersDTO: owners,
  });
}

it("SHOULD map owners to picker items", () => {
  expect(setup().stockOwners).toEqual([
    { label: "USER - Alice Test", value: "owner-1" },
    { label: "FAMILY - Test Family", value: "owner-2" },
  ]);
});

it("SHOULD list the transaction types", () => {
  expect(setup().transactionTypes).toEqual([
    { label: TransactionType.EXPENSE, value: TransactionType.EXPENSE },
    { label: TransactionType.INCOME, value: TransactionType.INCOME },
  ]);
});

it.each([
  ["owner-1", [{ label: "Checking", value: "acc-1" }]],
  ["owner-2", [{ label: "Joint", value: "acc-2" }]],
  ["missing", []],
])("SHOULD list accounts for owner %s", (ownerId, expected) => {
  expect(setup().accountsForOwner(ownerId)).toEqual(expected);
});

it.each([
  ["owner-1", [{ label: "Food", value: "cat-1" }]],
  ["owner-2", [{ label: "Rent", value: "cat-2" }]],
  ["missing", []],
])("SHOULD list categories for owner %s", (ownerId, expected) => {
  expect(setup().categoriesForOwner(ownerId)).toEqual(expected);
});

it.each([
  ["owner-1", OwnerType.USER],
  ["owner-2", OwnerType.FAMILY],
])("SHOULD resolve the owner type for %s", (ownerId, expected) => {
  expect(setup().ownerType(ownerId)).toBe(expected);
});
