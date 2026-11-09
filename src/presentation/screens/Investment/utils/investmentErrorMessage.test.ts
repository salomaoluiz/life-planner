import {
  AccountArchived,
  FamilyArchived,
  GenericError,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentClassLocked,
  InvestmentFeesAboveSale,
  InvestmentNegativePosition,
  TickerExists,
} from "@domain/entities/errors";

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
  [new FamilyArchived(), "family.errors.archived"],
  [new AccountArchived(), "financial.errors.accountArchived"],
  [new GenericError(), "common.errors.generic"],
])("SHOULD map %p to %s", (error, key) => {
  expect(getInvestmentErrorMessage(error)).toEqual({ key });
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
