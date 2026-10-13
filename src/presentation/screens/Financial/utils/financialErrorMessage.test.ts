import {
  AccountHasTransactions,
  CategoryHasTransactions,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
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
