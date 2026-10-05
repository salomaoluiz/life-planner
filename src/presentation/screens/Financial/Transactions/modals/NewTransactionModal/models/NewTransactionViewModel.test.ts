import CategoryDTO from "@application/dto/financial/CategoryDTO";
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

describe("categoriesForOwner with a type", () => {
  function setupWithTypes() {
    function category(id: string, name: string, type: string) {
      return new CategoryDTO({
        icon: "icon",
        id,
        name,
        owner: "USER",
        ownerId: "owner-1",
        type,
      });
    }

    return new NewTransactionViewModel({
      accountsDTO: accounts,
      categoriesDTO: [
        category("c-exp", "Food", TransactionType.EXPENSE),
        category("c-inc", "Salary", TransactionType.INCOME),
        new CategoryDTO({
          icon: "icon",
          id: "c-other",
          name: "Other owner",
          owner: "FAMILY",
          ownerId: "owner-2",
          type: TransactionType.EXPENSE,
        }),
      ],
      ownersDTO: owners,
    });
  }

  it.each([
    [TransactionType.EXPENSE, [{ label: "Food", value: "c-exp" }]],
    [TransactionType.INCOME, [{ label: "Salary", value: "c-inc" }]],
  ])("SHOULD list only the %s categories of the owner", (type, expected) => {
    expect(setupWithTypes().categoriesForOwner("owner-1", type)).toEqual(
      expected,
    );
  });

  it("SHOULD keep listing every category of the owner WHEN no type is given", () => {
    expect(setupWithTypes().categoriesForOwner("owner-1")).toEqual([
      { label: "Food", value: "c-exp" },
      { label: "Salary", value: "c-inc" },
    ]);
  });
});
