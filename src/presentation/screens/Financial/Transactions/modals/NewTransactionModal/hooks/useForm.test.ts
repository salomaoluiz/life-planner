import { act, renderHook } from "@tests";

import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { owners } from "../../../mocks/index.mocks";
import useForm from "./useForm";

const date = new Date("2025-02-01T10:00:00.000Z");

function fillRequired(result: ReturnType<typeof setup>["result"]) {
  act(() => {
    result.current.fields.description.onChange("Groceries");
    result.current.fields.value.onChange("50.00");
    result.current.fields.transactionDate.onChange(date);
    result.current.fields.accountId.onChange("acc-1");
    result.current.fields.categoryId.onChange("cat-1");
  });
}

function setup() {
  return renderHook(() => useForm());
}

function validate(result: ReturnType<typeof setup>["result"]) {
  let params: ReturnType<typeof result.current.validateForm>;
  act(() => {
    params = result.current.validateForm(owners);
  });
  return params!;
}

it("SHOULD start empty without errors", () => {
  const { result } = setup();

  expect(result.current.fields.description.value).toBe("");
  expect(result.current.fields.value.value).toBeUndefined();
  expect(result.current.errors).toEqual({});
});

it("SHOULD report every required field WHEN the form is empty", () => {
  const { result } = setup();

  expect(validate(result)).toBeUndefined();
  expect(result.current.errors).toEqual({
    accountId: "Account ID is required",
    categoryId: "Category ID is required",
    description: "Description is required",
    transactionDate: "Transaction Date is required",
    value: "Value is required",
  });
});

it("SHOULD report only the missing field", () => {
  const { result } = setup();
  fillRequired(result);
  act(() => result.current.fields.description.onChange(""));

  expect(validate(result)).toBeUndefined();
  expect(result.current.errors).toEqual({
    description: "Description is required",
  });
});

it("SHOULD default to the first owner, expense type and empty category name", () => {
  const { result } = setup();
  fillRequired(result);

  expect(validate(result)).toEqual({
    accountId: "acc-1",
    category: "",
    categoryId: "cat-1",
    date: date.toISOString(),
    description: "Groceries",
    owner: OwnerType.USER,
    ownerId: "owner-1",
    type: TransactionType.EXPENSE,
    value: "50.00",
  });
});

it.each([
  ["owner-1", OwnerType.USER],
  ["owner-2", OwnerType.FAMILY],
])("SHOULD submit the selected owner %s", (ownerId, owner) => {
  const { result } = setup();
  fillRequired(result);
  act(() => {
    result.current.fields.ownerId.onChange(ownerId);
    result.current.fields.owner.onChange(owner);
    result.current.fields.type.onChange(TransactionType.INCOME);
    result.current.fields.category.onChange("Salary");
  });

  expect(validate(result)).toEqual({
    accountId: "acc-1",
    category: "Salary",
    categoryId: "cat-1",
    date: date.toISOString(),
    description: "Groceries",
    owner,
    ownerId,
    type: TransactionType.INCOME,
    value: "50.00",
  });
});

it("SHOULD clear errors WHEN a later submit is valid", () => {
  const { result } = setup();
  validate(result);
  fillRequired(result);
  validate(result);

  expect(result.current.errors).toEqual({});
});

it.each(["abc", "0", "1.234,56", "-5"])(
  "SHOULD report an invalid amount in the form (and return no params) WHEN the value is %j",
  (value) => {
    const { result } = setup();
    fillRequired(result);
    act(() => {
      result.current.fields.value.onChange(value);
    });

    expect(validate(result)).toBeUndefined();
    expect(result.current.errors.value).toBe("Value must be a valid amount");
  },
);

it.each(["234,90", "234.9"])("SHOULD accept the amount %j", (value) => {
  const { result } = setup();
  fillRequired(result);
  act(() => {
    result.current.fields.value.onChange(value);
  });

  expect(validate(result)).toBeDefined();
  expect(result.current.errors).toEqual({});
});
