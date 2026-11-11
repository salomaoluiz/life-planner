import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";

// What the delete confirmation lists (spec 102 FR 38): the operations and the finance entries that go with them.
export function deleteSummary(asset: InvestmentAssetDetail): {
  entries: number;
  operations: number;
} {
  return {
    entries: asset.operations.filter((operation) => operation.transactionId)
      .length,
    operations: asset.operations.length,
  };
}

export function sellCount(asset: InvestmentAssetDetail): number {
  // A fraction sale is the cash of an event, not a sell the owner decided (spec 108 FR 15).
  return asset.operations.filter(
    (operation) =>
      operation.type === InvestmentOperationType.SELL &&
      operation.fractionOfOperationId === undefined,
  ).length;
}
