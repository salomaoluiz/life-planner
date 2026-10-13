import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewTransactionUIModel from "./NewTransactionUIModel";

function account(id: string, name: string, ownerId: string, status = "ACTIVE") {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name,
    owner: "USER",
    ownerId,
    status,
  });
}
function category(
  id: string,
  ownerId: string,
  type: string,
  parentId?: string,
) {
  return new CategoryDTO({
    icon: "food",
    id,
    name: id,
    owner: "USER",
    ownerId,
    parentId,
    type,
  });
}

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];
const accounts = [
  account("z-arch", "Zeta", "user-id", "ARCHIVED"),
  account("b", "Bravo", "user-id"),
  account("a", "Alpha", "user-id"),
  account("a-arch", "Aaa", "user-id", "ARCHIVED"),
  account("other", "Other", "family-1"),
];
const categories = [
  category("food", "user-id", "EXPENSE"),
  category("snacks", "user-id", "EXPENSE", "food"),
  category("salary", "user-id", "INCOME"),
  category("rent", "family-1", "EXPENSE"),
];

const model = new NewTransactionUIModel({ accounts, categories, owners });

it("SHOULD list ACTIVE accounts by name then ARCHIVED, only of the owner", () => {
  expect(model.accountOptions("user-id")).toEqual([
    { label: "Alpha", value: "a" },
    { label: "Bravo", value: "b" },
    {
      descriptionKey: "financial.accounts.archivedLabel",
      label: "Aaa",
      value: "a-arch",
    },
    {
      descriptionKey: "financial.accounts.archivedLabel",
      label: "Zeta",
      value: "z-arch",
    },
  ]);
  expect(model.accountIds("family-1")).toEqual(["other"]);
});

it("SHOULD build the category tree for the owner and type only", () => {
  const rows = model.categoryRows("user-id", "EXPENSE");

  expect(rows.map((row) => row.category.id)).toEqual(["food", "snacks"]);
  expect(rows.map((row) => row.depth)).toEqual([0, 1]);
  expect(model.categoryIds("user-id", "INCOME")).toEqual(["salary"]);
});

it("SHOULD tell whether the owner has accounts and categories", () => {
  expect(model.hasAccounts("user-id")).toBe(true);
  expect(model.hasAccounts("nobody")).toBe(false);
  expect(model.hasCategories("family-1", "EXPENSE")).toBe(true);
  expect(model.hasCategories("family-1", "INCOME")).toBe(false);
});

it("SHOULD resolve category names", () => {
  expect(model.categoryName("food")).toBe("food");
  expect(model.categoryName(undefined)).toBe("");
  expect(model.categoryName("gone")).toBe("");
});

it("SHOULD expose type options and owner choices", () => {
  expect(model.typeOptions).toEqual([
    { labelKey: "financial.common.expense", value: "EXPENSE" },
    { labelKey: "financial.common.income", value: "INCOME" },
  ]);
  expect(model.ownerChoices[0].labelKey).toBe("financial.common.personal");
});

it("SHOULD fall back to the first owner", () => {
  expect(model.owner("family-1").id).toBe("family-1");
  expect(model.owner("nobody").id).toBe("user-id");
});
