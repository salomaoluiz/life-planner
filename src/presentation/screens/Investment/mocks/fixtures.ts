import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
  InvestmentPriceSource,
  InvestmentQuoteMarket,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
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
    fx: null,
    id: "asset-1",
    name: "Itaúsa PN",
    operationCount: 4,
    operationsWithoutFxRate: 0,
    owner: OwnerType.USER,
    ownerId: "user-1",
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
    quantity: "500",
    realizedResult: null,
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
  makeOperation,
  makePosition,
  makeQuote,
  makeUsdAsset,
  makeValuation,
  owners,
};
