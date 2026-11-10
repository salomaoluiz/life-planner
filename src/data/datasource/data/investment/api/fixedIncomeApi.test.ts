import {
  ApiBusinessError,
  FieldInvalid,
  InvestmentRedemptionTooLarge,
  InvestmentUseFixedIncomeActions,
} from "@domain/entities/errors";
import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  InvestmentFixedIncomeRedemptionKind,
} from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import investmentApi from "./index";

jest.mock("@infrastructure/api", () => ({
  api: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const position = {
  averagePrice: null,
  cost: 1000000,
  currentUnitPrice: null,
  currentValue: 1128046,
  currentValueDate: "2026-11-10",
  openResult: 128046,
  openResultPercent: 0.128,
  quantity: "10000",
  realizedResult: 0,
};
const totals = { gross: 1128046, iof: 0, ir: 25609, net: 1102437 };
const apiFixedIncome = {
  adjustments: [{ date: "2026-10-31", grossAmount: 1627490, id: "adj-1" }],
  atMaturity: { gross: 1357480, iof: 0, ir: 53622, net: 1303858 },
  currentEffectiveRate: "16.510000",
  liquidity: "GRACE_PERIOD",
  liquidityDate: "2026-12-10",
  lots: [
    {
      date: "2026-01-15",
      days: 293,
      gross: 1128046,
      iof: 0,
      iofRate: "0",
      ir: 25609,
      irRate: "0.2",
      net: 1102437,
      operationId: "lot-1",
      principal: 1000000,
      remainingPrincipal: 1000000,
    },
  ],
  maturityDate: "2028-01-15",
  maturityPending: true,
  product: "CDB",
  rates: [
    {
      annualRate: null,
      cdiPercent: "110.0000",
      effectiveRate: "16.510000",
      id: "rate-1",
      indexRate: "14.9000",
      mode: "CDI_PERCENT",
      spread: null,
      startDate: "2026-01-15",
    },
  ],
  taxExempt: false,
  today: totals,
};
const apiDetail = {
  archivedAt: null,
  assetClass: "FIXED_INCOME",
  currency: "BRL",
  fixedIncome: apiFixedIncome,
  id: "asset-fi",
  name: "CDB Banco Exemplo 2028",
  operationCount: 1,
  operations: [
    {
      accountId: "acc-1",
      costRemoved: null,
      date: "2026-01-15",
      fees: [],
      feesTotal: 0,
      generateTransaction: true,
      gross: 1000000,
      id: "lot-1",
      netAmount: null,
      quantity: "10000",
      realizedResult: null,
      redemptionKind: null,
      total: 1000000,
      transactionId: "tx-1",
      type: "BUY",
      unitPrice: "1",
    },
  ],
  owner: "USER",
  ownerId: "owner-1",
  position,
  status: "ACTIVE",
  ticker: null,
  valuations: [],
};
const terms = {
  liquidity: InvestmentFixedIncomeLiquidity.GRACE_PERIOD,
  liquidityDate: "2026-12-10",
  maturityDate: "2028-01-15",
  product: InvestmentFixedIncomeProduct.CDB,
  taxExempt: false,
};
const cdi = {
  cdiPercent: "110",
  indexRate: "14,90",
  mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("the detail mapping", () => {
  it("SHOULD map the summary, lots, rates, adjustments AND the projection", async () => {
    jest.mocked(api.post).mockResolvedValue({ item: apiDetail });

    const detail = await investmentApi.createFixedIncomeTitle({
      contribution: {
        accountId: "acc-1",
        amount: 1000000,
        date: "2026-01-15",
        generateTransaction: true,
      },
      name: "CDB",
      owner: OwnerType.USER,
      ownerId: "owner-1",
      rate: { ...cdi, startDate: undefined },
      terms,
    });

    expect(detail.fixedIncome).toMatchObject({
      currentEffectiveRate: "16.510000",
      liquidity: "GRACE_PERIOD",
      liquidityDate: "2026-12-10",
      maturityPending: true,
      product: "CDB",
      taxExempt: false,
    });
    expect(detail.fixedIncome?.today).toEqual(totals);
    expect(detail.fixedIncome?.atMaturity.net).toBe(1303858);
    expect(detail.fixedIncome?.lots[0]).toMatchObject({
      irRate: "0.2",
      remainingPrincipal: 1000000,
    });
    expect(detail.fixedIncome?.rates[0]).toMatchObject({
      cdiPercent: "110.0000",
      mode: "CDI_PERCENT",
    });
    expect(detail.fixedIncome?.adjustments[0].grossAmount).toBe(1627490);
    expect(detail.operations[0]).toMatchObject({
      netAmount: null,
      redemptionKind: null,
    });
  });

  it("SHOULD map a list item with no history (summary only) AND a missing fixedIncome as null", async () => {
    jest.mocked(api.get).mockResolvedValue({
      items: [
        {
          ...apiDetail,
          fixedIncome: {
            ...apiFixedIncome,
            adjustments: undefined,
            atMaturity: undefined,
            lots: undefined,
            rates: undefined,
          },
        },
        { ...apiDetail, fixedIncome: null },
      ],
    });

    const assets = await investmentApi.getAssets({ status: "ACTIVE" as never });

    expect(assets[0].fixedIncome?.lots).toEqual([]);
    expect(assets[0].fixedIncome?.atMaturity).toEqual({
      gross: 0,
      iof: 0,
      ir: 0,
      net: 0,
    });
    expect(assets[1].fixedIncome).toBeNull();
  });
});

describe("rates", () => {
  it.each([
    [
      cdi,
      {
        cdiPercent: "110",
        indexRate: "14.9",
        mode: "CDI_PERCENT",
        startDate: "2026-10-01",
      },
    ],
    [
      {
        indexRate: "4,5",
        mode: InvestmentFixedIncomeRateMode.IPCA_PLUS,
        spread: "6.2",
      },
      {
        indexRate: "4.5",
        mode: "IPCA_PLUS",
        spread: "6.2",
        startDate: "2026-10-01",
      },
    ],
    [
      { annualRate: "13,5", mode: InvestmentFixedIncomeRateMode.PREFIXED },
      { annualRate: "13.5", mode: "PREFIXED", startDate: "2026-10-01" },
    ],
  ])("SHOULD send only the fields of the mode: %p", async (rate, body) => {
    jest.mocked(api.post).mockResolvedValue({ item: apiDetail });

    await investmentApi.createFixedIncomeRate("asset-fi", {
      ...rate,
      startDate: "2026-10-01",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-fi/fixed-income/rates",
      body,
    );
  });

  it("SHOULD refuse a percentage that is not above zero BEFORE any call", async () => {
    await expect(
      investmentApi.createFixedIncomeRate("asset-fi", {
        ...cdi,
        cdiPercent: "0",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.createFixedIncomeRate("asset-fi", {
        mode: InvestmentFixedIncomeRateMode.PREFIXED,
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("SHOULD update AND delete an entry", async () => {
    jest.mocked(api.patch).mockResolvedValue({ item: apiDetail });
    jest.mocked(api.delete).mockResolvedValue(undefined);

    const detail = await investmentApi.updateFixedIncomeRate({
      id: "rate-1",
      rate: { ...cdi, startDate: "2026-10-01" },
    });
    await investmentApi.deleteFixedIncomeRate("rate-1");

    expect(detail.id).toBe("asset-fi");
    expect(api.patch).toHaveBeenCalledWith(
      "/v1/investments/fixed-income/rates/rate-1",
      expect.objectContaining({ mode: "CDI_PERCENT" }),
    );
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/investments/fixed-income/rates/rate-1",
    );
  });
});

describe("terms", () => {
  it("SHOULD put the terms with the rate WHEN converting AND without it otherwise", async () => {
    jest.mocked(api.put).mockResolvedValue({ item: apiDetail });

    await investmentApi.upsertFixedIncomeTerms({
      assetId: "asset-fi",
      rate: { ...cdi, startDate: "2026-01-15" },
      terms,
    });
    await investmentApi.upsertFixedIncomeTerms({ assetId: "asset-fi", terms });

    expect(api.put).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/assets/asset-fi/fixed-income/terms",
      expect.objectContaining({
        liquidityDate: "2026-12-10",
        rate: expect.objectContaining({ startDate: "2026-01-15" }),
      }),
    );
    expect(api.put).toHaveBeenNthCalledWith(
      2,
      "/v1/investments/assets/asset-fi/fixed-income/terms",
      expect.objectContaining({ rate: undefined }),
    );
  });
});

describe("contributions and redemptions", () => {
  const written = {
    detail: apiDetail,
    item: apiDetail.operations[0],
    liquidityWarning: "AT_MATURITY",
  };

  it("SHOULD post a contribution without the account WHEN no finance entry is generated", async () => {
    jest.mocked(api.post).mockResolvedValue(written);

    const result = await investmentApi.createFixedIncomeContribution({
      accountId: "acc-1",
      amount: 500000,
      assetId: "asset-fi",
      date: "2026-10-20",
      generateTransaction: false,
    });

    expect(result.liquidityWarning).toBe("AT_MATURITY");
    expect(result.operation.id).toBe("lot-1");
    expect(result.detail.fixedIncome?.product).toBe("CDB");
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-fi/fixed-income/contributions",
      {
        accountId: undefined,
        amount: 500000,
        date: "2026-10-20",
        generateTransaction: false,
      },
    );
  });

  it("SHOULD post a redemption with the kind AND the real net", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValue({ ...written, liquidityWarning: null });

    const result = await investmentApi.createFixedIncomeRedemption({
      accountId: "acc-1",
      assetId: "asset-fi",
      date: "2026-11-04",
      generateTransaction: true,
      kind: InvestmentFixedIncomeRedemptionKind.PARTIAL,
      netAmount: 600000,
    });

    expect(result.liquidityWarning).toBeNull();
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-fi/fixed-income/redemptions",
      {
        accountId: "acc-1",
        date: "2026-11-04",
        generateTransaction: true,
        kind: "PARTIAL",
        netAmount: 600000,
      },
    );
  });

  it("SHOULD turn a 422 with availableNet into InvestmentRedemptionTooLarge", async () => {
    jest.mocked(api.post).mockRejectedValue(
      new ApiBusinessError(
        "This is more than the title is worth",
        422,
        {},
        {
          details: { availableNet: 1603607 },
          message: "This is more than the title is worth",
        },
      ),
    );

    const error = await investmentApi
      .previewFixedIncomeRedemption({
        assetId: "asset-fi",
        date: "2026-11-04",
        kind: InvestmentFixedIncomeRedemptionKind.PARTIAL,
        netAmount: 9000000,
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvestmentRedemptionTooLarge);
    expect((error as InvestmentRedemptionTooLarge).availableNet).toBe(1603607);
  });

  it("SHOULD turn a 422 that names the redemption date into InvestmentRedemptionTooLarge", async () => {
    jest.mocked(api.delete).mockRejectedValue(
      new ApiBusinessError(
        "This change makes the redemption of 2026-11-04 larger than the title",
        422,
        {},
        {
          details: { date: "2026-11-04", operationId: "sell-1" },
          message:
            "This change makes the redemption of 2026-11-04 larger than the title",
        },
      ),
    );

    const error = await investmentApi
      .deleteFixedIncomeRate("rate-1")
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvestmentRedemptionTooLarge);
    expect((error as InvestmentRedemptionTooLarge).date).toBe("2026-11-04");
  });

  it("SHOULD turn the generic route refusal into InvestmentUseFixedIncomeActions", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(
        new ApiBusinessError(
          "Use the fixed income actions for this title",
          422,
        ),
      );

    await expect(
      investmentApi.createFixedIncomeContribution({
        amount: 1,
        assetId: "asset-fi",
        date: "2026-10-20",
        generateTransaction: false,
      }),
    ).rejects.toBeInstanceOf(InvestmentUseFixedIncomeActions);
  });
});

describe("adjustments, simulation and preview", () => {
  it("SHOULD upsert an adjustment by date AND return the computed gross", async () => {
    jest.mocked(api.put).mockResolvedValue({
      detail: apiDetail,
      item: {
        computedGross: 1628915,
        date: "2026-10-31",
        grossAmount: 1627490,
        id: "adj-1",
      },
    });
    jest.mocked(api.delete).mockResolvedValue(undefined);

    const result = await investmentApi.upsertFixedIncomeAdjustment({
      assetId: "asset-fi",
      date: "2026-10-31",
      grossAmount: 1627490,
    });
    await investmentApi.deleteFixedIncomeAdjustment("adj-1");

    expect(result.computedGross).toBe(1628915);
    expect(result.item.grossAmount).toBe(1627490);
    expect(api.put).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-fi/fixed-income/adjustments/2026-10-31",
      { grossAmount: 1627490 },
    );
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/investments/fixed-income/adjustments/adj-1",
    );
  });

  it("SHOULD simulate a new title AND preview a redemption", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValueOnce({
        atMaturity: { gross: 1357480, iof: 0, ir: 53622, net: 1303858 },
        effectiveRate: "16.510000",
      })
      .mockResolvedValueOnce({
        gross: 613935,
        iof: 0,
        ir: 13935,
        liquidityWarning: "AT_MATURITY",
        lots: [
          {
            date: "2026-01-15",
            gross: 613935,
            operationId: "lot-1",
            principalUsed: 544246,
          },
        ],
        net: 600000,
        remaining: { gross: 1017131, principal: 955754 },
      });

    const simulation = await investmentApi.simulateFixedIncome({
      amount: 1000000,
      date: "2026-01-15",
      maturityDate: "2028-01-15",
      rate: cdi,
      taxExempt: false,
    });
    const preview = await investmentApi.previewFixedIncomeRedemption({
      assetId: "asset-fi",
      date: "2026-11-04",
      kind: InvestmentFixedIncomeRedemptionKind.PARTIAL,
      netAmount: 600000,
    });

    expect(simulation).toEqual({
      atMaturity: { gross: 1357480, iof: 0, ir: 53622, net: 1303858 },
      effectiveRate: "16.510000",
    });
    expect(preview.lots[0].principalUsed).toBe(544246);
    expect(preview.remaining).toEqual({ gross: 1017131, principal: 955754 });
    expect(preview.liquidityWarning).toBe("AT_MATURITY");
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/fixed-income/simulate",
      expect.objectContaining({
        rate: {
          cdiPercent: "110",
          indexRate: "14.9",
          mode: "CDI_PERCENT",
          startDate: undefined,
        },
      }),
    );
  });
});
