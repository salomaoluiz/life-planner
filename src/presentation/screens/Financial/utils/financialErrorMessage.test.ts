import {
  AccountArchived,
  AccountHasTransactions,
  CategoryHasTransactions,
  CreditCardHasTransactions,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
  InvoiceHasProjected,
  TransactionNotProjected,
  TransferAccountArchived,
  TransferAmountInRequired,
  TransferAmountMismatch,
  TransferDateInBeforeOut,
  TransferRowUseTransfer,
  TransferSameAccount,
} from "@domain/entities/errors";

import { getFinancialErrorMessageKey } from "./financialErrorMessage";

it("SHOULD return undefined WHEN there is no error", () => {
  expect(getFinancialErrorMessageKey(null)).toBeUndefined();
  expect(getFinancialErrorMessageKey(undefined)).toBeUndefined();
});

it("SHOULD map each 006 business error to its copy key", () => {
  expect(getFinancialErrorMessageKey(new AccountHasTransactions())).toBe(
    "financial.accounts.errors.hasTransactions",
  );
  expect(getFinancialErrorMessageKey(new CategoryHasTransactions())).toBe(
    "financial.categories.errors.hasTransactions",
  );
  expect(getFinancialErrorMessageKey(new CreditCardHasTransactions())).toBe(
    "financial.cards.delete.hasTransactions",
  );
  expect(getFinancialErrorMessageKey(new FinancialNotFound())).toBe(
    "financial.errors.notFound",
  );
  expect(getFinancialErrorMessageKey(new FinancialOwnerNotAllowed())).toBe(
    "financial.errors.ownerNotAllowed",
  );
});

it("SHOULD fall back to the generic message for any other error", () => {
  expect(getFinancialErrorMessageKey(new GenericError())).toBe(
    "common.errors.generic",
  );
  expect(getFinancialErrorMessageKey(new Error("boom"))).toBe(
    "common.errors.generic",
  );
});

it("SHOULD map AccountArchived to its copy", () => {
  expect(getFinancialErrorMessageKey(new AccountArchived())).toBe(
    "financial.errors.accountArchived",
  );
});

it("SHOULD map the spec 096 errors: a stale confirm has its copy, the projected list is shown by its own UI", () => {
  expect(getFinancialErrorMessageKey(new TransactionNotProjected())).toBe(
    "financial.errors.notProjected",
  );
  expect(
    getFinancialErrorMessageKey(new InvoiceHasProjected([])),
  ).toBeUndefined();
});

it.each([
  [new TransferSameAccount(), "financial.errors.transferSameAccount"],
  [new TransferAccountArchived(), "financial.errors.transferAccountArchived"],
  [new TransferAmountMismatch(), "financial.errors.transferAmountMismatch"],
  [new TransferAmountInRequired(), "financial.errors.transferAmountInRequired"],
  [new TransferDateInBeforeOut(), "financial.errors.transferDateInBeforeOut"],
  [new TransferRowUseTransfer(), "financial.errors.transferRowUseTransfer"],
])("SHOULD map the spec 098 error %#  to its copy key", (error, key) => {
  expect(getFinancialErrorMessageKey(error)).toBe(key);
});
