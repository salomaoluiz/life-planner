import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  changeOwner,
  changeType,
  chipCategories,
  createInitialState,
  defaultAccountId,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  TransactionFormState,
  validate,
} from "./transactionFormState";

function account(id: string, ownerId: string, status = "ACTIVE") {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name: id,
    owner: "USER",
    ownerId,
    status,
  });
}
function category(id: string, ownerId: string, type: string) {
  return new CategoryDTO({
    icon: "food",
    id,
    name: id,
    owner: "USER",
    ownerId,
    type,
  });
}

const accounts = [
  account("archived", "user-id", "ARCHIVED"),
  account("active", "user-id"),
  account("family-acc", "family-1"),
];
const categories = [
  category("food", "user-id", "EXPENSE"),
  category("salary", "user-id", "INCOME"),
  category("rent", "family-1", "EXPENSE"),
];
const user = new OwnerDTO({
  id: "user-id",
  name: "Alice",
  type: OwnerType.USER,
});
const now = new Date(2026, 9, 5, 15, 45);

function state(
  overrides: Partial<TransactionFormState> = {},
): TransactionFormState {
  return {
    accountId: "active",
    amountCents: 31290,
    categoryId: "food",
    date: new Date(2026, 9, 5),
    description: "Groceries",
    ownerId: "user-id",
    type: TransactionType.EXPENSE,
    ...overrides,
  };
}

it("SHOULD pick the first ACTIVE account of the owner as default", () => {
  expect(defaultAccountId(accounts, "user-id")).toBe("active");
  expect(
    defaultAccountId([account("archived", "user-id", "ARCHIVED")], "user-id"),
  ).toBeUndefined();
  expect(defaultAccountId(accounts, "nobody")).toBeUndefined();
});

it("SHOULD create an expense form for today with the default account", () => {
  expect(createInitialState({ accounts, now, ownerId: "user-id" })).toEqual({
    accountId: "active",
    amountCents: 0,
    categoryId: undefined,
    date: new Date(2026, 9, 5),
    description: "",
    ownerId: "user-id",
    type: TransactionType.EXPENSE,
  });
});

it("SHOULD build the state of an existing transaction from its DTO", () => {
  const dto = new TransactionDTO({
    accountId: "active",
    category: "Food",
    categoryId: "food",
    date: new Date(2026, 8, 30).toISOString(),
    description: "Shop",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    type: "INCOME",
    value: "312.90",
  });

  expect(stateFromDto(dto)).toEqual({
    accountId: "active",
    amountCents: 31290,
    categoryId: "food",
    date: new Date(2026, 8, 30),
    description: "Shop",
    ownerId: "user-id",
    type: TransactionType.INCOME,
  });
});

it("SHOULD clear a category of the other type WHEN the type changes", () => {
  expect(
    changeType(state(), TransactionType.INCOME, categories).categoryId,
  ).toBeUndefined();
  expect(
    changeType(
      state({ categoryId: "salary", type: TransactionType.INCOME }),
      TransactionType.EXPENSE,
      categories,
    ).categoryId,
  ).toBeUndefined();
  expect(
    changeType(state(), TransactionType.EXPENSE, categories).categoryId,
  ).toBe("food");
});

it("SHOULD keep amount and description WHEN the type changes", () => {
  const next = changeType(state(), TransactionType.INCOME, categories);

  expect(next.amountCents).toBe(31290);
  expect(next.description).toBe("Groceries");
  expect(next.type).toBe(TransactionType.INCOME);
});

it("SHOULD clear category and swap the account WHEN the owner changes", () => {
  const next = changeOwner(state(), "family-1", categories, accounts);

  expect(next.ownerId).toBe("family-1");
  expect(next.categoryId).toBeUndefined();
  expect(next.accountId).toBe("family-acc");
});

it("SHOULD clear the account WHEN the new owner has no active account", () => {
  const next = changeOwner(state(), "family-2", categories, accounts);

  expect(next.accountId).toBeUndefined();
});

it("SHOULD keep selections that already belong to the owner", () => {
  const next = changeOwner(state(), "user-id", categories, accounts);

  expect(next.categoryId).toBe("food");
  expect(next.accountId).toBe("active");
});

describe("validate", () => {
  it("SHOULD accept a complete form", () => {
    expect(validate(state())).toEqual({});
  });

  it("SHOULD require amount greater than zero", () => {
    expect(validate(state({ amountCents: 0 })).amount).toBe(
      "financial.transactions.form.errors.amountRequired",
    );
  });

  it("SHOULD reject amounts above 2147483647 cents and accept the limit", () => {
    expect(validate(state({ amountCents: 2147483648 })).amount).toBe(
      "financial.transactions.form.errors.amountTooLarge",
    );
    expect(validate(state({ amountCents: 2147483647 })).amount).toBeUndefined();
  });

  it("SHOULD require a description and limit it to 200 characters", () => {
    expect(validate(state({ description: "   " })).description).toBe(
      "financial.transactions.form.errors.descriptionRequired",
    );
    expect(validate(state({ description: "a".repeat(201) })).description).toBe(
      "financial.transactions.form.errors.descriptionTooLong",
    );
    expect(
      validate(state({ description: "a".repeat(200) })).description,
    ).toBeUndefined();
  });

  it("SHOULD require category and account", () => {
    const errors = validate(
      state({ accountId: undefined, categoryId: undefined }),
    );

    expect(errors.categoryId).toBe(
      "financial.transactions.form.errors.categoryRequired",
    );
    expect(errors.accountId).toBe(
      "financial.transactions.form.errors.accountRequired",
    );
  });

  it("SHOULD reject an invalid date", () => {
    expect(validate(state({ date: new Date("invalid") })).date).toBe(
      "financial.transactions.form.errors.dateRequired",
    );
  });
});

it("SHOULD compare states by value including the date", () => {
  expect(isSameState(state(), state())).toBe(true);
  expect(isSameState(state(), state({ amountCents: 1 }))).toBe(false);
  expect(isSameState(state(), state({ date: new Date(2026, 9, 6) }))).toBe(
    false,
  );
});

it("SHOULD build create params with the decimal string value and trimmed description", () => {
  expect(
    toCreateParams(state({ description: " Groceries " }), user, "Food"),
  ).toEqual({
    accountId: "active",
    category: "Food",
    categoryId: "food",
    date: new Date(2026, 9, 5).toISOString(),
    description: "Groceries",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "312.90",
  });
});

it("SHOULD build update params with the transaction id", () => {
  expect(toUpdateParams("tx-1", state(), user, "Food")).toMatchObject({
    id: "tx-1",
    owner: "USER",
    value: "312.90",
  });
});

it("SHOULD append the selected category to the chips WHEN it is not in the top list", () => {
  const top = [categories[0]];
  const all = categories;

  expect(chipCategories(top, "salary", all).map((c) => c.id)).toEqual([
    "food",
    "salary",
  ]);
  expect(chipCategories(top, "food", all).map((c) => c.id)).toEqual(["food"]);
  expect(chipCategories(top, undefined, all).map((c) => c.id)).toEqual([
    "food",
  ]);
  expect(chipCategories(top, "gone", all).map((c) => c.id)).toEqual(["food"]);
});

it("SHOULD find the id of a newly created record", () => {
  expect(pickNewRecordId(["a"], [{ id: "a" }, { id: "b" }])).toBe("b");
  expect(pickNewRecordId(["a"], [{ id: "a" }])).toBeUndefined();
  expect(pickNewRecordId([], [])).toBeUndefined();
});

it("SHOULD normalize a date to local midnight", () => {
  expect(normalizeDate(new Date(2026, 9, 5, 23, 59))).toEqual(
    new Date(2026, 9, 5),
  );
});
