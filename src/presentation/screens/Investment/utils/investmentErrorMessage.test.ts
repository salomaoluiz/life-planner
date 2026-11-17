import {
  AccountArchived,
  FamilyArchived,
  GenericError,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentArchivedDestination,
  InvestmentClassLocked,
  InvestmentConversionChainLocked,
  InvestmentConversionLaterOperations,
  InvestmentConvertedOrigin,
  InvestmentFeesAboveSale,
  InvestmentNegativePosition,
  InvestmentRedemptionTooLarge,
  InvestmentUseConversionRoute,
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

describe("conversions (spec 112)", () => {
  it("SHOULD name the ticker AND the date of the later conversion", () => {
    expect(
      getInvestmentErrorMessage(
        new InvestmentConversionChainLocked("BTHF11", "2026-11-20"),
        (day) => `<${day}>`,
      ),
    ).toEqual({
      key: "investment.conversion.errors.chainLocked",
      params: { date: "<2026-11-20>", ticker: "BTHF11" },
    });
  });

  it("SHOULD list the dates of the operations after the record date", () => {
    expect(
      getInvestmentErrorMessage(
        new InvestmentConversionLaterOperations("BCFF11", "2026-10-15", [
          "2026-10-20",
          "2026-11-01",
        ]),
        (day) => `<${day}>`,
      ),
    ).toEqual({
      key: "investment.conversion.errors.laterOperations",
      params: {
        date: "<2026-10-15>",
        dates: "<2026-10-20>, <2026-11-01>",
        ticker: "BCFF11",
      },
    });
  });

  it.each([
    [
      new InvestmentConvertedOrigin("BTHF11"),
      "investment.conversion.errors.convertedOrigin",
    ],
    [
      new InvestmentArchivedDestination(),
      "investment.conversion.errors.archivedDestination",
    ],
    [
      new InvestmentUseConversionRoute(),
      "investment.conversion.errors.useRoute",
    ],
  ])("SHOULD map %p to %s", (error, key) => {
    expect(getInvestmentErrorMessage(error)?.key).toBe(key);
  });
});
