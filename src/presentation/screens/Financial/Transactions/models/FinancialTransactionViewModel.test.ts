import { captureMessage } from "@infrastructure/monitoring";

import {
  makeTransactionDTO,
  makeTransactionViewModel,
  owners,
} from "../mocks/index.mocks";
import FinancialTransactionViewModel, {
  SortRule,
} from "./FinancialTransactionViewModel";

jest.mock("@infrastructure/monitoring", () => ({ captureMessage: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD expose the plain transaction fields", () => {
  const vm = makeTransactionViewModel();

  expect(vm.description).toBe("Groceries");
  expect(vm.value).toBe("R$ 50.00");
  expect(vm.ids).toEqual({ ownerId: "owner-1", transactionId: "tx-1" });
  expect(vm.transactionDate).toBe(
    new Date("2025-01-10T12:00:00.000Z").toLocaleDateString(),
  );
});

it("SHOULD return the account name WHEN present and empty text WHEN absent", () => {
  expect(makeTransactionViewModel().accountName).toBe("Checking");
  expect(makeTransactionViewModel({ accountName: undefined }).accountName).toBe(
    "",
  );
});

it("SHOULD prefer the category name and fall back to the category value", () => {
  expect(makeTransactionViewModel().category).toBe("Food");
  expect(
    makeTransactionViewModel({ category: "Other", categoryName: undefined })
      .category,
  ).toBe("Other");
});

it.each([
  ["EXPENSE", true, "Expense"],
  ["INCOME", false, "Income"],
])("SHOULD map type %s", (type, isExpense, label) => {
  const vm = makeTransactionViewModel({ type });

  expect(vm.isExpense).toBe(isExpense);
  expect(vm.type).toBe(label);
  expect(captureMessage).not.toHaveBeenCalled();
});

it("SHOULD show Unknown and report WHEN the type is invalid", () => {
  const vm = makeTransactionViewModel({ type: "WEIRD" });

  expect(vm.type).toBe("Unknown");
  expect(captureMessage).toHaveBeenCalledWith(
    "Invalid Transaction Type, showing as Unknown",
    { dto: expect.objectContaining({ id: "tx-1", type: "WEIRD" }) },
  );
});

it.each([
  ["USER", "owner-1", "Alice Test (Personal)"],
  ["FAMILY", "owner-2", "Test Family (Family)"],
  ["USER", "missing", "undefined (Personal)"],
])("SHOULD label owner type %s with id %s as %s", (owner, ownerId, label) => {
  expect(makeTransactionViewModel({ owner, ownerId }).owner).toBe(label);
});

describe("sort", () => {
  it("SHOULD sort by date ascending", () => {
    const late = new FinancialTransactionViewModel(
      makeTransactionDTO({ date: "2025-03-01T00:00:00Z", id: "late" }),
      owners,
    );
    const early = new FinancialTransactionViewModel(
      makeTransactionDTO({ date: "2025-01-01T00:00:00Z", id: "early" }),
      owners,
    );

    const sorted = FinancialTransactionViewModel.sort(
      [late, early],
      SortRule.DATE_ASC,
    );

    expect(sorted.map((t) => t.ids.transactionId)).toEqual(["early", "late"]);
  });

  it("SHOULD throw WHEN the rule is invalid", () => {
    expect(() =>
      FinancialTransactionViewModel.sort([], "NOPE" as SortRule),
    ).toThrow("Invalid sort rule");
  });
});
