import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentOperation,
  InvestmentPosition,
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
    currency: "BRL",
    id: "asset-1",
    name: "Itaúsa PN",
    operationCount: 4,
    owner: OwnerType.USER,
    ownerId: "user-1",
    position: makePosition(),
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
  makeValuation,
  owners,
};
