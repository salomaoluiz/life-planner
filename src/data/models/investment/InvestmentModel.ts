import { toCurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
  InvestmentFixedIncomeRedemptionKind,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
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
  InvestmentEventSuggestion,
  InvestmentFixedIncome,
  InvestmentFixedIncomeAdjustmentResult,
  InvestmentFixedIncomeRedemptionPreview,
  InvestmentFixedIncomeSimulation,
  InvestmentFixedIncomeTotals,
  InvestmentFixedIncomeWriteResult,
  InvestmentFx,
  InvestmentIncome,
  InvestmentIncomeDefaults,
  InvestmentIncomePage,
  InvestmentIncomeSuggestion,
  InvestmentIncomeSummary,
  InvestmentOperation,
  InvestmentOperationEvent,
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
      fixedIncome: data.fixedIncome
        ? InvestmentModel.toFixedIncome(data.fixedIncome as Json)
        : null,
      fx: data.fx ? InvestmentModel.toFx(data.fx as Json) : null,
      id: data.id as string,
      name: data.name as string,
      operationCount: Number(data.operationCount ?? 0),
      operationsWithoutFxRate: Number(data.operationsWithoutFxRate ?? 0),
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      pendingEventSuggestions: Number(data.pendingEventSuggestions ?? 0),
      pendingFractionCount: Number(data.pendingFractionCount ?? 0),
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

  // Spec 105 FR 26: the list sends the summary, the detail also the history, lots and projection.
  // Spec 108: nulls are left out of the payload; the optional fields stay undefined.
  static toEventSuggestion(data: Json): InvestmentEventSuggestion {
    return {
      assetId: data.assetId as string,
      averagePriceAfter:
        (data.averagePriceAfter as string | undefined) ?? undefined,
      averagePriceBefore:
        (data.averagePriceBefore as string | undefined) ?? undefined,
      bonusPercent: (data.bonusPercent as string | undefined) ?? undefined,
      bonusUnitCost: (data.bonusUnitCost as string | undefined) ?? undefined,
      currency: toCurrencyCode(data.currency),
      date: data.date as string,
      fractionQuantity: (data.fractionQuantity as string) ?? "0",
      id: data.id as string,
      quantityAfter: data.quantityAfter as string,
      quantityBefore: data.quantityBefore as string,
      ratioFrom: (data.ratioFrom as string | undefined) ?? undefined,
      ratioTo: (data.ratioTo as string | undefined) ?? undefined,
      ticker: data.ticker as string,
      type: data.type as InvestmentOperationType,
    };
  }

  static toFixedIncome(data: Json): InvestmentFixedIncome {
    return {
      adjustments: ((data.adjustments as Json[]) ?? []).map((row) => ({
        date: row.date as string,
        grossAmount: Number(row.grossAmount),
        id: row.id as string,
      })),
      atMaturity: InvestmentModel.toFixedIncomeTotals(data.atMaturity as Json),
      currentEffectiveRate:
        (data.currentEffectiveRate as null | string) ?? null,
      liquidity: data.liquidity as InvestmentFixedIncomeLiquidity,
      liquidityDate: (data.liquidityDate as null | string) ?? null,
      lots: ((data.lots as Json[]) ?? []).map((lot) => ({
        date: lot.date as string,
        days: Number(lot.days),
        gross: Number(lot.gross),
        iof: Number(lot.iof),
        iofRate: lot.iofRate as string,
        ir: Number(lot.ir),
        irRate: lot.irRate as string,
        net: Number(lot.net),
        operationId: lot.operationId as string,
        principal: Number(lot.principal),
        remainingPrincipal: Number(lot.remainingPrincipal),
      })),
      maturityDate: data.maturityDate as string,
      maturityPending: data.maturityPending === true,
      product: data.product as InvestmentFixedIncomeProduct,
      rates: ((data.rates as Json[]) ?? []).map((rate) => ({
        annualRate: (rate.annualRate as null | string) ?? null,
        cdiPercent: (rate.cdiPercent as null | string) ?? null,
        effectiveRate: rate.effectiveRate as string,
        id: rate.id as string,
        indexRate: (rate.indexRate as null | string) ?? null,
        mode: rate.mode as InvestmentFixedIncomeRateMode,
        spread: (rate.spread as null | string) ?? null,
        startDate: rate.startDate as string,
      })),
      taxExempt: data.taxExempt === true,
      today: InvestmentModel.toFixedIncomeTotals(data.today as Json),
    };
  }

  static toFixedIncomeAdjustmentResult(
    data: Json,
  ): InvestmentFixedIncomeAdjustmentResult {
    const item = data.item as Json;

    return {
      computedGross: Number(item.computedGross),
      detail: InvestmentModel.toAssetDetail(data.detail as Json),
      item: {
        date: item.date as string,
        grossAmount: Number(item.grossAmount),
        id: item.id as string,
      },
    };
  }

  static toFixedIncomeRedemptionPreview(
    data: Json,
  ): InvestmentFixedIncomeRedemptionPreview {
    const remaining = data.remaining as Json;

    return {
      gross: Number(data.gross),
      iof: Number(data.iof),
      ir: Number(data.ir),
      liquidityWarning:
        (data.liquidityWarning as InvestmentFixedIncomeLiquidity) ?? null,
      lots: ((data.lots as Json[]) ?? []).map((lot) => ({
        date: lot.date as string,
        gross: Number(lot.gross),
        operationId: lot.operationId as string,
        principalUsed: Number(lot.principalUsed),
      })),
      net: Number(data.net),
      remaining: {
        gross: Number(remaining.gross),
        principal: Number(remaining.principal),
      },
    };
  }

  static toFixedIncomeSimulation(data: Json): InvestmentFixedIncomeSimulation {
    return {
      atMaturity: InvestmentModel.toFixedIncomeTotals(data.atMaturity as Json),
      effectiveRate: data.effectiveRate as string,
    };
  }

  static toFixedIncomeTotals(
    data: Json | undefined,
  ): InvestmentFixedIncomeTotals {
    return {
      gross: Number(data?.gross ?? 0),
      iof: Number(data?.iof ?? 0),
      ir: Number(data?.ir ?? 0),
      net: Number(data?.net ?? 0),
    };
  }

  static toFixedIncomeWriteResult(
    data: Json,
  ): InvestmentFixedIncomeWriteResult {
    return {
      detail: InvestmentModel.toAssetDetail(data.detail as Json),
      liquidityWarning:
        (data.liquidityWarning as InvestmentFixedIncomeLiquidity) ?? null,
      operation: InvestmentModel.toOperation(data.item as Json),
    };
  }

  static toFx(data: Json): InvestmentFx {
    return {
      quotedAt: data.quotedAt as string,
      rate: data.rate as string,
    };
  }

  static toIncome(data: Json): InvestmentIncome {
    return {
      accountId: (data.accountId as string | undefined) ?? undefined,
      amountPerUnit: (data.amountPerUnit as string | undefined) ?? undefined,
      assetId: data.assetId as string,
      categoryId: (data.categoryId as string | undefined) ?? undefined,
      currency: toCurrencyCode(data.currency),
      estimatedGross: Number(data.estimatedGross ?? data.netAmount ?? 0),
      estimatedWithheld: Number(data.estimatedWithheld ?? 0),
      exDate: (data.exDate as string | undefined) ?? undefined,
      id: data.id as string,
      netAmount: Number(data.netAmount),
      notes: (data.notes as string | undefined) ?? undefined,
      overdue: data.overdue === true,
      paymentDate: data.paymentDate as string,
      quantity: (data.quantity as string | undefined) ?? undefined,
      status: data.status as InvestmentIncomeStatus,
      suggestionId: (data.suggestionId as string | undefined) ?? undefined,
      transactionId: (data.transactionId as string | undefined) ?? undefined,
      type: data.type as InvestmentIncomeType,
      withholdingRate: (data.withholdingRate as string | undefined) ?? "0",
    };
  }

  static toIncomeDefaults(data: Json): InvestmentIncomeDefaults {
    return {
      accountId: (data.accountId as null | string) ?? null,
      categoryId: (data.categoryId as null | string) ?? null,
      currency: toCurrencyCode(data.currency),
      quantity: (data.quantity as string) ?? "0",
      withholdingRate: (data.withholdingRate as string) ?? "0",
    };
  }

  static toIncomePage(data: Json): InvestmentIncomePage {
    return {
      items: ((data.items as Json[]) ?? []).map((item) =>
        InvestmentModel.toIncome(item),
      ),
      nextCursor: (data.nextCursor as null | string) ?? null,
      summary: data.summary
        ? InvestmentModel.toIncomeSummary(data.summary as Json)
        : undefined,
    };
  }

  static toIncomeSuggestion(data: Json): InvestmentIncomeSuggestion {
    return {
      amountPerUnit: data.amountPerUnit as string,
      assetId: data.assetId as string,
      canApproveDirectly: data.canApproveDirectly === true,
      currency: toCurrencyCode(data.currency),
      estimatedGross: Number(data.estimatedGross),
      estimatedNet: Number(data.estimatedNet),
      exDate: data.exDate as string,
      id: data.id as string,
      paymentDate: (data.paymentDate as string | undefined) ?? undefined,
      quantity: data.quantity as string,
      ticker: data.ticker as string,
      type: data.type as InvestmentIncomeType,
      withholdingRate: (data.withholdingRate as string) ?? "0",
    };
  }

  static toIncomeSummary(data: Json): InvestmentIncomeSummary {
    return {
      currency: toCurrencyCode(data.currency),
      pendingSuggestions: Number(data.pendingSuggestions ?? 0),
      plannedTotal: Number(data.plannedTotal ?? 0),
      receivedThisYear: Number(data.receivedThisYear ?? 0),
    };
  }

  static toOperation(data: Json): InvestmentOperation {
    return {
      accountId: (data.accountId as null | string) ?? null,
      corporateEvent: InvestmentModel.toOperationEvent(data),
      costRemoved: (data.costRemoved as null | number) ?? null,
      date: data.date as string,
      fees: ((data.fees as Json[]) ?? []).map((fee) => ({
        amount: Number(fee.amount),
        description: (fee.description as null | string) ?? null,
        id: fee.id as string,
        kind: fee.kind as InvestmentFeeKind,
      })),
      feesTotal: Number(data.feesTotal ?? 0),
      fractionOfOperationId:
        (data.fractionOfOperationId as string | undefined) ?? undefined,
      fxRate: (data.fxRate as null | string) ?? null,
      generateTransaction: data.generateTransaction === true,
      gross: Number(data.gross ?? 0),
      id: data.id as string,
      netAmount: (data.netAmount as null | number) ?? null,
      quantity: (data.quantity as string | undefined) ?? "0",
      realizedResult: (data.realizedResult as null | number) ?? null,
      redemptionKind:
        (data.redemptionKind as InvestmentFixedIncomeRedemptionKind) ?? null,
      total: Number(data.total ?? 0),
      transactionId: (data.transactionId as null | string) ?? null,
      type: data.type as InvestmentOperationType,
      unitPrice: (data.unitPrice as string | undefined) ?? "0",
    };
  }

  // Spec 108: only an event carries `quantityBefore`; the money fields of an event are left out of the payload.
  static toOperationEvent(data: Json): InvestmentOperationEvent | undefined {
    if (data.quantityBefore === undefined) {
      return undefined;
    }

    return {
      averagePriceAfter: (data.averagePriceAfter as null | string) ?? null,
      averagePriceBefore: (data.averagePriceBefore as null | string) ?? null,
      bonusPercent: (data.bonusPercent as string | undefined) ?? undefined,
      bonusUnitCost: (data.bonusUnitCost as string | undefined) ?? undefined,
      fractionCost: Number(data.fractionCost ?? 0),
      fractionQuantity: (data.fractionQuantity as string) ?? "0",
      quantityAfter: data.quantityAfter as string,
      quantityBefore: data.quantityBefore as string,
      ratioFrom: (data.ratioFrom as string | undefined) ?? undefined,
      ratioTo: (data.ratioTo as string | undefined) ?? undefined,
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
      pendingFractions: ((data.pendingFractions as Json[]) ?? []).map(
        (fraction) => ({
          cost: Number(fraction.cost),
          date: fraction.date as string,
          eventId: fraction.eventId as string,
          quantity: fraction.quantity as string,
        }),
      ),
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
