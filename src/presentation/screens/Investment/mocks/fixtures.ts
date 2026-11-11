import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
  InvestmentOperationType,
  InvestmentPriceSource,
  InvestmentQuoteMarket,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentEventSuggestion,
  InvestmentFixedIncome,
  InvestmentIncome,
  InvestmentIncomeSuggestion,
  InvestmentOperation,
  InvestmentPosition,
  InvestmentQuote,
  InvestmentValuation,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

const owners = [
  new OwnerDTO({ id: "user-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "fam-1", name: "Test Family", type: OwnerType.FAMILY }),
];

function makeAsset(overrides: Partial<InvestmentAsset> = {}): InvestmentAsset {
  return {
    archivedAt: null,
    assetClass: InvestmentAssetClass.BR_STOCK,
    averageFxRate: null,
    brl: null,
    currency: "BRL",
    fixedIncome: null,
    fx: null,
    id: "asset-1",
    name: "Itaúsa PN",
    operationCount: 4,
    operationsWithoutFxRate: 0,
    owner: OwnerType.USER,
    ownerId: "user-1",
    pendingEventSuggestions: 0,
    pendingFractionCount: 0,
    position: makePosition(),
    priceSource: null,
    quote: null,
    status: InvestmentAssetStatus.ACTIVE,
    ticker: "ITSA4",
    ...overrides,
  };
}

function makeDetail(
  overrides: Partial<InvestmentAssetDetail> = {},
): InvestmentAssetDetail {
  return {
    ...makeAsset(),
    operations: [
      makeOperation({
        costRemoved: 294660,
        date: "2026-09-15",
        id: "op-sell",
        quantity: "300",
        realizedResult: 31790,
        total: 326450,
        type: InvestmentOperationType.SELL,
        unitPrice: "10.9",
      }),
      makeOperation(),
    ],
    valuations: [makeValuation()],
    ...overrides,
  };
}

// Spec 108: the 10:1 reverse split of the design (3.155 -> 315, fraction of 0,5 costing R$ 5,06).
function makeEventOperation(
  overrides: Partial<InvestmentOperation> = {},
): InvestmentOperation {
  return makeOperation({
    accountId: null,
    corporateEvent: {
      averagePriceAfter: "10.11409524",
      averagePriceBefore: "1.01141046",
      fractionCost: 506,
      fractionQuantity: "0.5",
      quantityAfter: "315",
      quantityBefore: "3155",
      ratioFrom: "10",
      ratioTo: "1",
    },
    costRemoved: null,
    date: "2026-03-10",
    fees: [],
    feesTotal: 0,
    generateTransaction: false,
    gross: 0,
    id: "event-1",
    quantity: "0",
    total: 0,
    transactionId: null,
    type: InvestmentOperationType.REVERSE_SPLIT,
    unitPrice: "0",
    ...overrides,
  });
}

// Spec 105: a calculated CDB of R$ 15.000 in two lots (cents).
// Spec 108: an announced 10% bonus on 315 shares (data-com 18/11), the card of the design.
function makeEventSuggestion(
  overrides: Partial<InvestmentEventSuggestion> = {},
): InvestmentEventSuggestion {
  return {
    assetId: "asset-1",
    averagePriceAfter: "9.61109827",
    averagePriceBefore: "10.11409524",
    bonusPercent: "10",
    bonusUnitCost: "4.5",
    currency: "BRL",
    date: "2026-11-18",
    fractionQuantity: "0.5",
    id: "esug-1",
    quantityAfter: "346",
    quantityBefore: "315",
    ticker: "MGLU3",
    type: InvestmentOperationType.BONUS,
    ...overrides,
  };
}

function makeFixedIncome(
  overrides: Partial<InvestmentFixedIncome> = {},
): InvestmentFixedIncome {
  return {
    adjustments: [],
    atMaturity: { gross: 1907132, iof: 0, ir: 61070, net: 1846062 },
    currentEffectiveRate: "16.510000",
    liquidity: InvestmentFixedIncomeLiquidity.AT_MATURITY,
    liquidityDate: null,
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
      {
        date: "2026-10-20",
        days: 15,
        gross: 503020,
        iof: 1510,
        iofRate: "0.5",
        ir: 340,
        irRate: "0.225",
        net: 501170,
        operationId: "lot-2",
        principal: 500000,
        remainingPrincipal: 500000,
      },
    ],
    maturityDate: "2028-01-15",
    maturityPending: false,
    product: InvestmentFixedIncomeProduct.CDB,
    rates: [
      {
        annualRate: null,
        cdiPercent: "110.0000",
        effectiveRate: "16.510000",
        id: "rate-1",
        indexRate: "14.9000",
        mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
        spread: null,
        startDate: "2026-01-15",
      },
    ],
    taxExempt: false,
    today: { gross: 1631066, iof: 1510, ir: 25949, net: 1603607 },
    ...overrides,
  };
}

function makeFixedIncomeDetail(
  overrides: Partial<InvestmentAssetDetail> = {},
): InvestmentAssetDetail {
  return {
    ...makeAsset({
      assetClass: InvestmentAssetClass.FIXED_INCOME,
      fixedIncome: makeFixedIncome(),
      id: "asset-fi",
      name: "CDB Banco Exemplo 2028",
      ticker: null,
    }),
    fixedIncome: makeFixedIncome(),
    operations: [
      makeOperation({
        date: "2026-10-20",
        id: "lot-2",
        quantity: "5000",
        total: 500000,
        unitPrice: "1",
      }),
      makeOperation({
        date: "2026-01-15",
        id: "lot-1",
        quantity: "10000",
        total: 1000000,
        unitPrice: "1",
      }),
    ],
    valuations: [],
    ...overrides,
  };
}

// Spec 108: the sale of that fraction for R$ 5,20 (realized +R$ 0,14).
function makeFractionSale(
  overrides: Partial<InvestmentOperation> = {},
): InvestmentOperation {
  return makeOperation({
    costRemoved: 506,
    date: "2026-04-04",
    fees: [],
    feesTotal: 0,
    fractionOfOperationId: "event-1",
    gross: 520,
    id: "sale-1",
    quantity: "0.5",
    realizedResult: 14,
    total: 520,
    type: InvestmentOperationType.SELL,
    unitPrice: "10.4",
    ...overrides,
  });
}

function makeIncome(
  overrides: Partial<InvestmentIncome> = {},
): InvestmentIncome {
  return {
    accountId: "acc-1",
    amountPerUnit: "0.28",
    assetId: "asset-1",
    categoryId: "cat-1",
    currency: "BRL",
    estimatedGross: 8400,
    estimatedWithheld: 1260,
    exDate: "2026-09-10",
    id: "income-1",
    netAmount: 7140,
    overdue: false,
    paymentDate: "2026-10-30",
    quantity: "300",
    status: InvestmentIncomeStatus.RECEIVED,
    transactionId: "tx-1",
    type: InvestmentIncomeType.JCP,
    withholdingRate: "0.15",
    ...overrides,
  };
}

function makeOperation(
  overrides: Partial<InvestmentOperation> = {},
): InvestmentOperation {
  return {
    accountId: "acc-1",
    costRemoved: null,
    date: "2026-06-10",
    fees: [
      {
        amount: 490,
        description: null,
        id: "fee-1",
        kind: InvestmentFeeKind.BROKERAGE,
      },
    ],
    feesTotal: 490,
    fxRate: null,
    generateTransaction: true,
    gross: 510000,
    id: "op-1",
    netAmount: null,
    quantity: "500",
    realizedResult: null,
    redemptionKind: null,
    total: 510490,
    transactionId: "tx-1",
    type: InvestmentOperationType.BUY,
    unitPrice: "10.2",
    ...overrides,
  };
}

function makePosition(
  overrides: Partial<InvestmentPosition> = {},
): InvestmentPosition {
  return {
    averagePrice: "9.822",
    cost: 1178640,
    currentUnitPrice: "10.53",
    currentValue: 1263600,
    currentValueDate: "2026-11-01",
    openResult: 84960,
    openResultPercent: 0.0721,
    pendingFractions: [],
    quantity: "1200",
    realizedResult: 31790,
    ...overrides,
  };
}

function makeQuote(overrides: Partial<InvestmentQuote> = {}): InvestmentQuote {
  return {
    changePercent: "1.24",
    dayHigh: "232.1",
    dayLow: "228.9",
    market: InvestmentQuoteMarket.US,
    previousClose: "228.57",
    price: "231.4",
    quotedAt: "2026-11-04T16:00:00.000Z",
    source: "FINNHUB",
    stale: false,
    ticker: "AAPL",
    unavailable: false,
    ...overrides,
  };
}

function makeSuggestion(
  overrides: Partial<InvestmentIncomeSuggestion> = {},
): InvestmentIncomeSuggestion {
  return {
    amountPerUnit: "0.47",
    assetId: "asset-1",
    canApproveDirectly: true,
    currency: "BRL",
    estimatedGross: 14100,
    estimatedNet: 14100,
    exDate: "2026-11-21",
    id: "sug-1",
    paymentDate: "2026-12-19",
    quantity: "300",
    ticker: "PETR4",
    type: InvestmentIncomeType.DIVIDEND,
    withholdingRate: "0",
    ...overrides,
  };
}

function makeUsdAsset(
  overrides: Partial<InvestmentAsset> = {},
): InvestmentAsset {
  return makeAsset({
    assetClass: InvestmentAssetClass.FOREIGN_STOCK,
    averageFxRate: "5.2236",
    brl: {
      cost: 1902435,
      marketValue: 2573214,
      result: 670779,
      resultFromAsset: 515047,
      resultFromFx: 155732,
      resultPercent: 0.3526,
    },
    currency: "USD",
    fx: { quotedAt: "2026-11-04T16:00:00.000Z", rate: "5.5601" },
    id: "asset-usd",
    name: "Apple Inc.",
    position: makePosition({
      averagePrice: "182.1",
      cost: 364200,
      currentUnitPrice: "231.4",
      currentValue: 462800,
      currentValueDate: "2026-11-04",
      openResult: 98600,
      openResultPercent: 0.2707,
      quantity: "20",
    }),
    priceSource: InvestmentPriceSource.QUOTE,
    quote: makeQuote(),
    ticker: "AAPL",
    ...overrides,
  });
}

function makeValuation(
  overrides: Partial<InvestmentValuation> = {},
): InvestmentValuation {
  return {
    date: "2026-11-01",
    id: "val-1",
    source: InvestmentValuationSource.MANUAL,
    unitPrice: "10.53",
    ...overrides,
  };
}

export {
  makeAsset,
  makeDetail,
  makeEventOperation,
  makeEventSuggestion,
  makeFixedIncome,
  makeFixedIncomeDetail,
  makeFractionSale,
  makeIncome,
  makeOperation,
  makePosition,
  makeQuote,
  makeSuggestion,
  makeUsdAsset,
  makeValuation,
  owners,
};
