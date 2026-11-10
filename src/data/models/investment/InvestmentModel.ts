import { toCurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
  InvestmentPriceKind,
  InvestmentPriceSource,
  InvestmentQuoteMarket,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentBrlResult,
  InvestmentFx,
  InvestmentOperation,
  InvestmentOperationResult,
  InvestmentPosition,
  InvestmentPriceHistory,
  InvestmentQuote,
  InvestmentQuotesRefresh,
  InvestmentTickerSuggestion,
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
      averageFxRate: (data.averageFxRate as null | string) ?? null,
      brl: InvestmentModel.toBrlResult(data),
      currency: toCurrencyCode(data.currency),
      fx: data.fx ? InvestmentModel.toFx(data.fx as Json) : null,
      id: data.id as string,
      name: data.name as string,
      operationCount: Number(data.operationCount ?? 0),
      operationsWithoutFxRate: Number(data.operationsWithoutFxRate ?? 0),
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      position: InvestmentModel.toPosition(data.position as Json),
      priceSource: (data.currentPriceSource as InvestmentPriceSource) ?? null,
      quote: data.quote ? InvestmentModel.toQuote(data.quote as Json) : null,
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

  // The flat BRL fields of a USD asset (spec 104); null when the API sent no BRL result.
  static toBrlResult(data: Json): InvestmentBrlResult | null {
    if (typeof data.resultBrl !== "number") {
      return null;
    }

    return {
      cost: Number(data.costBrl ?? 0),
      marketValue: Number(data.marketValueBrl ?? 0),
      result: data.resultBrl,
      resultFromAsset: Number(data.resultBrlFromAsset ?? 0),
      resultFromFx: Number(data.resultBrlFromFx ?? 0),
      resultPercent: (data.resultBrlPercent as null | number) ?? null,
    };
  }

  static toFx(data: Json): InvestmentFx {
    return {
      quotedAt: data.quotedAt as string,
      rate: data.rate as string,
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
      fxRate: (data.fxRate as null | string) ?? null,
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

  static toPriceHistory(data: Json): InvestmentPriceHistory {
    return {
      currency: toCurrencyCode(data.currency),
      historyStartsAt: (data.historyStartsAt as null | string) ?? null,
      points: ((data.points as Json[]) ?? []).map((point) => ({
        date: point.date as string,
        fxRate: (point.fxRate as null | string) ?? null,
        kind: point.kind as InvestmentPriceKind,
        price: point.price as string,
      })),
    };
  }

  static toQuote(data: Json): InvestmentQuote {
    return {
      changePercent: (data.changePercent as null | string) ?? null,
      dayHigh: (data.dayHigh as null | string) ?? null,
      dayLow: (data.dayLow as null | string) ?? null,
      market: data.market as InvestmentQuoteMarket,
      previousClose: (data.previousClose as null | string) ?? null,
      price: data.price as string,
      quotedAt: data.quotedAt as string,
      source: (data.source as string) ?? "",
      stale: data.stale === true,
      ticker: data.ticker as string,
      unavailable: data.unavailable === true,
    };
  }

  static toQuotesRefresh(data: Json): InvestmentQuotesRefresh {
    const fx = data.fx as Json | null;

    return {
      fx: fx
        ? {
            pair: fx.pair as string,
            quotedAt: fx.quotedAt as string,
            rate: fx.rate as string,
          }
        : null,
      nextRefreshAt: data.nextRefreshAt as string,
      quotes: ((data.quotes as Json[]) ?? []).map((quote) =>
        InvestmentModel.toQuote(quote),
      ),
    };
  }

  static toTickerSuggestion(data: Json): InvestmentTickerSuggestion {
    return {
      changePercent: (data.changePercent as null | string) ?? null,
      currency: toCurrencyCode(data.currency),
      exchange: (data.exchange as string) ?? "",
      logoUrl: (data.logoUrl as null | string) ?? null,
      market: data.market as InvestmentQuoteMarket,
      name: (data.name as null | string) ?? null,
      price: data.price as string,
      ticker: data.ticker as string,
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
