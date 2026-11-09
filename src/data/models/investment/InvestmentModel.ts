import { toCurrencyCode } from "@domain/entities/financial/Currency";
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
  InvestmentOperationResult,
  InvestmentPosition,
  InvestmentValuation,
  InvestmentValuationResult,
} from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

type Json = Record<string, unknown>;

// The API shape is the model: quantities and unit prices stay decimal strings, money stays integer cents.
class InvestmentModel {
  static toAsset(data: Json): InvestmentAsset {
    return {
      archivedAt: (data.archivedAt as null | string) ?? null,
      assetClass: data.assetClass as InvestmentAssetClass,
      currency: toCurrencyCode(data.currency),
      id: data.id as string,
      name: data.name as string,
      operationCount: Number(data.operationCount ?? 0),
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      position: InvestmentModel.toPosition(data.position as Json),
      status: data.status as InvestmentAssetStatus,
      ticker: (data.ticker as null | string) ?? null,
    };
  }

  static toAssetDetail(data: Json): InvestmentAssetDetail {
    return {
      ...InvestmentModel.toAsset(data),
      operations: ((data.operations as Json[]) ?? []).map((operation) =>
        InvestmentModel.toOperation(operation),
      ),
      valuations: ((data.valuations as Json[]) ?? []).map((valuation) =>
        InvestmentModel.toValuation(valuation),
      ),
    };
  }

  static toOperation(data: Json): InvestmentOperation {
    return {
      accountId: (data.accountId as null | string) ?? null,
      costRemoved: (data.costRemoved as null | number) ?? null,
      date: data.date as string,
      fees: ((data.fees as Json[]) ?? []).map((fee) => ({
        amount: Number(fee.amount),
        description: (fee.description as null | string) ?? null,
        id: fee.id as string,
        kind: fee.kind as InvestmentFeeKind,
      })),
      feesTotal: Number(data.feesTotal ?? 0),
      generateTransaction: data.generateTransaction === true,
      gross: Number(data.gross ?? 0),
      id: data.id as string,
      quantity: data.quantity as string,
      realizedResult: (data.realizedResult as null | number) ?? null,
      total: Number(data.total ?? 0),
      transactionId: (data.transactionId as null | string) ?? null,
      type: data.type as InvestmentOperationType,
      unitPrice: data.unitPrice as string,
    };
  }

  static toOperationResult(data: Json): InvestmentOperationResult {
    return {
      operation: InvestmentModel.toOperation(data.item as Json),
      position: InvestmentModel.toPosition(data.position as Json),
    };
  }

  static toPosition(data: Json): InvestmentPosition {
    return {
      averagePrice: (data.averagePrice as null | string) ?? null,
      cost: Number(data.cost ?? 0),
      currentUnitPrice: (data.currentUnitPrice as null | string) ?? null,
      currentValue: (data.currentValue as null | number) ?? null,
      currentValueDate: (data.currentValueDate as null | string) ?? null,
      openResult: (data.openResult as null | number) ?? null,
      openResultPercent: (data.openResultPercent as null | number) ?? null,
      quantity: (data.quantity as string) ?? "0",
      realizedResult: Number(data.realizedResult ?? 0),
    };
  }

  static toValuation(data: Json): InvestmentValuation {
    return {
      date: data.date as string,
      id: data.id as string,
      source: data.source as InvestmentValuationSource,
      unitPrice: data.unitPrice as string,
    };
  }

  static toValuationResult(data: Json): InvestmentValuationResult {
    return {
      position: InvestmentModel.toPosition(data.position as Json),
      valuation: InvestmentModel.toValuation(data.item as Json),
    };
  }
}

export default InvestmentModel;
