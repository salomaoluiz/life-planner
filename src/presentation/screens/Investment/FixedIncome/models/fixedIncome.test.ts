import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
} from "@domain/entities/investment/enums";
import {
  InvestmentFixedIncome,
  InvestmentFixedIncomeRate,
} from "@domain/entities/investment/InvestmentEntities";

import {
  chipsOf,
  defaultTaxExempt,
  emptyRateForm,
  fractionToPercent,
  isRateFormValid,
  latestRate,
  liquidityWarningOf,
  lotTaxesKey,
  percentText,
  previewEffectiveRate,
  rateEntry,
  rateFieldsOf,
  rateFormFrom,
  rateSummary,
  toRateParams,
} from "./fixedIncome";

const rate: InvestmentFixedIncomeRate = {
  annualRate: null,
  cdiPercent: "110.0000",
  effectiveRate: "16.510000",
  id: "rate-1",
  mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
  spread: null,
  startDate: "2026-10-01",
};
const totals = { gross: 0, iof: 0, ir: 0, net: 0 };

function fixedIncome(
  overrides: Partial<InvestmentFixedIncome> = {},
): InvestmentFixedIncome {
  return {
    adjustments: [],
    atMaturity: totals,
    currentEffectiveRate: "16.510000",
    indexMissing: false,
    liquidity: InvestmentFixedIncomeLiquidity.AT_MATURITY,
    liquidityDate: null,
    lots: [],
    maturityDate: "2028-01-15",
    maturityPending: false,
    needsReview: null,
    product: InvestmentFixedIncomeProduct.CDB,
    rates: [rate],
    taxExempt: false,
    today: totals,
    ...overrides,
  };
}

describe("defaultTaxExempt", () => {
  it.each([
    [InvestmentFixedIncomeProduct.LCI, true],
    [InvestmentFixedIncomeProduct.LCA, true],
    [InvestmentFixedIncomeProduct.CRI, true],
    [InvestmentFixedIncomeProduct.CRA, true],
    [InvestmentFixedIncomeProduct.INCENTIVIZED_DEBENTURE, true],
    [InvestmentFixedIncomeProduct.CDB, false],
    [InvestmentFixedIncomeProduct.TREASURY, false],
    [InvestmentFixedIncomeProduct.DEBENTURE, false],
    [InvestmentFixedIncomeProduct.OTHER, false],
  ])("SHOULD default %s to exempt=%s", (product, expected) => {
    expect(defaultTaxExempt(product)).toBe(expected);
  });
});

describe("percentText", () => {
  it("SHOULD format with at most 2 places in the locale", () => {
    expect(percentText("16.510000", "pt-BR")).toBe("16,51");
    expect(percentText("16.510000", "en-US")).toBe("16.51");
    expect(percentText("110.0000", "pt-BR")).toBe("110");
  });

  it("SHOULD show a dash WHEN there is no value", () => {
    expect(percentText(null, "pt-BR")).toBe("—");
  });
});

describe("rate form", () => {
  it("SHOULD need the fields of the mode", () => {
    expect(rateFieldsOf(InvestmentFixedIncomeRateMode.PREFIXED)).toEqual([
      "annualRate",
    ]);
    expect(rateFieldsOf(InvestmentFixedIncomeRateMode.CDI_PERCENT)).toEqual([
      "cdiPercent",
    ]);
    expect(rateFieldsOf(InvestmentFixedIncomeRateMode.IPCA_PLUS)).toEqual([
      "spread",
    ]);
  });

  it("SHOULD start empty in CDI mode AND be invalid until every field is above zero", () => {
    const form = emptyRateForm();

    expect(form.mode).toBe(InvestmentFixedIncomeRateMode.CDI_PERCENT);
    expect(isRateFormValid(form)).toBe(false);
    expect(isRateFormValid({ ...form, cdiPercent: "0" })).toBe(false);
    expect(isRateFormValid({ ...form, cdiPercent: "110" })).toBe(true);
  });

  it("SHOULD pre-fill from the latest entry AND build the params", () => {
    const form = rateFormFrom(rate);

    expect(form).toMatchObject({ cdiPercent: "110.0000" });
    expect(form).not.toHaveProperty("indexRate");
    expect(toRateParams(form, "2026-12-01")).toMatchObject({
      mode: "CDI_PERCENT",
      startDate: "2026-12-01",
    });
  });

  it("SHOULD pick the latest entry by start date", () => {
    const older = { ...rate, id: "rate-0", startDate: "2026-01-15" };

    expect(latestRate(fixedIncome({ rates: [older, rate] }))?.id).toBe(
      "rate-1",
    );
    expect(latestRate(fixedIncome({ rates: [] }))).toBeUndefined();
  });
});

describe("rate descriptions", () => {
  it("SHOULD describe each mode in the rate line", () => {
    expect(rateSummary(rate, "pt-BR", "14.90")).toEqual({
      key: "investment.fixedIncome.rateLineCdi",
      params: { index: "14,9", percent: "110" },
    });
    expect(rateSummary(rate, "pt-BR")).toEqual({
      key: "investment.fixedIncome.rateLineCdiNoIndex",
      params: { percent: "110" },
    });
    expect(
      rateSummary(
        {
          ...rate,
          annualRate: null,
          mode: InvestmentFixedIncomeRateMode.IPCA_PLUS,
          spread: "6.2000",
        },
        "pt-BR",
      ).key,
    ).toBe("investment.fixedIncome.rateLineIpca");
    expect(
      rateSummary(
        {
          ...rate,
          annualRate: "13.5000",
          mode: InvestmentFixedIncomeRateMode.PREFIXED,
        },
        "en-US",
      ),
    ).toEqual({
      key: "investment.fixedIncome.rateLinePrefixed",
      params: { rate: "13.5" },
    });
  });

  it("SHOULD describe each mode in the history entry with the effective rate", () => {
    expect(rateEntry(rate, "pt-BR")).toEqual({
      key: "investment.fixedIncome.rateEntryCdi",
      params: { effective: "16,51", percent: "110" },
    });
    expect(
      rateEntry(
        { ...rate, mode: InvestmentFixedIncomeRateMode.IPCA_PLUS, spread: "6" },
        "pt-BR",
      ).key,
    ).toBe("investment.fixedIncome.rateEntryIpca");
    expect(
      rateEntry(
        {
          ...rate,
          annualRate: "13",
          mode: InvestmentFixedIncomeRateMode.PREFIXED,
        },
        "pt-BR",
      ).key,
    ).toBe("investment.fixedIncome.rateEntryPrefixed");
  });
});

describe("lot taxes", () => {
  it.each([
    [false, "0", "investment.fixedIncome.lotTaxes"],
    [false, "0.5", "investment.fixedIncome.lotTaxesIof"],
    [true, "0", "investment.fixedIncome.lotTaxesExempt"],
    [true, "0.5", "investment.fixedIncome.lotTaxesExemptIof"],
  ])("SHOULD pick the text for exempt=%s iof=%s", (exempt, iof, key) => {
    expect(lotTaxesKey(exempt, iof)).toBe(key);
  });

  it("SHOULD show the rate as a percentage", () => {
    expect(fractionToPercent("0.225", "pt-BR")).toBe("22,5");
    expect(fractionToPercent("0.2", "en-US")).toBe("20");
  });
});

describe("chipsOf", () => {
  function format(day: string): string {
    return `d:${day}`;
  }

  it("SHOULD show the maturity AND the liquidity of an at-maturity title", () => {
    expect(chipsOf(fixedIncome(), format)).toEqual([
      {
        key: "investment.fixedIncome.chipMaturity",
        params: { date: "d:2028-01-15" },
        tone: "default",
      },
      {
        key: "investment.fixedIncome.liquidity.AT_MATURITY",
        params: {},
        tone: "default",
      },
    ]);
  });

  it("SHOULD mark daily liquidity as income AND the grace period as warning", () => {
    expect(
      chipsOf(
        fixedIncome({ liquidity: InvestmentFixedIncomeLiquidity.DAILY }),
        format,
      )[1].tone,
    ).toBe("income");
    expect(
      chipsOf(
        fixedIncome({
          liquidity: InvestmentFixedIncomeLiquidity.GRACE_PERIOD,
          liquidityDate: "2026-12-10",
        }),
        format,
      )[1],
    ).toEqual({
      key: "investment.fixedIncome.chipGrace",
      params: { date: "d:2026-12-10" },
      tone: "warning",
    });
  });
});

describe("liquidityWarningOf", () => {
  it("SHOULD warn before maturity for at-maturity AND never for daily", () => {
    expect(liquidityWarningOf(fixedIncome(), "2027-01-01")).toBe("AT_MATURITY");
    expect(liquidityWarningOf(fixedIncome(), "2028-01-15")).toBeNull();
    expect(
      liquidityWarningOf(
        fixedIncome({ liquidity: InvestmentFixedIncomeLiquidity.DAILY }),
        "2026-01-01",
      ),
    ).toBeNull();
  });

  it("SHOULD warn before the grace date only", () => {
    const grace = fixedIncome({
      liquidity: InvestmentFixedIncomeLiquidity.GRACE_PERIOD,
      liquidityDate: "2026-12-10",
    });

    expect(liquidityWarningOf(grace, "2026-12-09")).toBe("GRACE_PERIOD");
    expect(liquidityWarningOf(grace, "2026-12-10")).toBeNull();
  });
});

const indexes = {
  cdi: {
    annual: "14.90",
    daily: "0.0551310",
    date: "2026-11-11",
    followers: 1,
    lastChangeDate: null,
    stale: false,
  },
  fx: [],
  ipca: {
    accumulated12m: "4.68",
    expected12m: "4.50",
    expectedDate: "2026-11-11",
    followers: 0,
    month: "2026-10",
    monthly: "0.32",
    stale: false,
  },
  lastSuccessAt: null,
  selic: null,
};

describe("previewEffectiveRate", () => {
  it("SHOULD be null until the form is valid", () => {
    expect(previewEffectiveRate(emptyRateForm(), indexes)).toBeNull();
  });

  it("SHOULD be null WHILE the index is not stored yet", () => {
    const form = { ...emptyRateForm(), cdiPercent: "110" };

    expect(previewEffectiveRate(form)).toBeNull();
    expect(previewEffectiveRate(form, { ...indexes, cdi: null })).toBeNull();
    expect(
      previewEffectiveRate(
        {
          ...emptyRateForm(InvestmentFixedIncomeRateMode.IPCA_PLUS),
          spread: "6.2",
        },
        { ...indexes, ipca: null },
      ),
    ).toBeNull();
  });

  it("SHOULD annualize the stored daily CDI by the percent (same as the API)", () => {
    const expected = (Math.pow(1 + (0.055131 * 1.1) / 100, 252) - 1) * 100;

    expect(
      previewEffectiveRate({ ...emptyRateForm(), cdiPercent: "110" }, indexes),
    ).toBeCloseTo(expected, 6);
  });

  it("SHOULD compound the IPCA expectation and the spread AND return the prefixed rate", () => {
    expect(
      previewEffectiveRate(
        {
          ...emptyRateForm(InvestmentFixedIncomeRateMode.IPCA_PLUS),
          spread: "6.2",
        },
        indexes,
      ),
    ).toBeCloseTo(10.979, 3);
    expect(
      previewEffectiveRate({
        ...emptyRateForm(InvestmentFixedIncomeRateMode.PREFIXED),
        annualRate: "13.5",
      }),
    ).toBeCloseTo(13.5, 6);
  });
});
