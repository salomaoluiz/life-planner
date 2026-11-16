import {
  AccountArchived,
  FamilyArchived,
  GenericError,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentClassLocked,
  InvestmentFeesAboveSale,
  InvestmentNegativePosition,
  InvestmentRedemptionTooLarge,
  InvestmentUseFixedIncomeActions,
  TickerClassMismatch,
  TickerExists,
} from "@domain/entities/errors";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import getInvestmentErrorMessage from "./investmentErrorMessage";

it("SHOULD return undefined WHEN there is no error", () => {
  expect(getInvestmentErrorMessage(null)).toBeUndefined();
});

it.each([
  [
    new InvestmentAccountNotChangeable(),
    "investment.errors.accountNotChangeable",
  ],
  [new InvestmentArchived(), "investment.errors.archived"],
  [new InvestmentClassLocked(), "investment.errors.classLocked"],
  [new InvestmentFeesAboveSale(), "investment.errors.feesAboveSale"],
  [new TickerExists(), "investment.errors.tickerExists"],
  [
    new InvestmentUseFixedIncomeActions(),
    "investment.fixedIncome.errors.useActions",
  ],
  [new FamilyArchived(), "family.errors.archived"],
  [new AccountArchived(), "financial.errors.accountArchived"],
  [new GenericError(), "common.errors.generic"],
])("SHOULD map %p to %s", (error, key) => {
  expect(getInvestmentErrorMessage(error)).toEqual({ key });
});

it.each([
  [InvestmentAssetClass.BR_REIT, "investment.ticker.classMismatch.BR_REIT"],
  [InvestmentAssetClass.BR_STOCK, "investment.ticker.classMismatch.BR_STOCK"],
])("SHOULD name the expected class %s of a mismatch (spec 111)", (cls, key) => {
  expect(getInvestmentErrorMessage(new TickerClassMismatch(cls))).toEqual({
    key,
  });
});

it("SHOULD carry the formatted date of a negative position", () => {
  expect(
    getInvestmentErrorMessage(
      new InvestmentNegativePosition("2026-09-15"),
      (day) => `fmt:${day}`,
    ),
  ).toEqual({
    key: "investment.errors.negativePosition",
    params: { date: "fmt:2026-09-15" },
  });
  expect(
    getInvestmentErrorMessage(new InvestmentNegativePosition("2026-09-15")),
  ).toMatchObject({ params: { date: "2026-09-15" } });
});

it("SHOULD carry the formatted date of the redemption that stopped fitting (spec 105 FR 21)", () => {
  expect(
    getInvestmentErrorMessage(
      new InvestmentRedemptionTooLarge({ date: "2026-11-04" }),
      (day) => `fmt:${day}`,
    ),
  ).toEqual({
    key: "investment.fixedIncome.errors.redemptionTooLarge",
    params: { date: "fmt:2026-11-04" },
  });
  expect(
    getInvestmentErrorMessage(new InvestmentRedemptionTooLarge({}))?.params,
  ).toEqual({ date: "" });
});
