import { previewConversion } from "@domain/entities/investment/conversion";
import {
  InvestmentAssetClass,
  InvestmentOperationType,
  isInvestmentConversion,
} from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentConversion,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

export interface ConversionDeleteSummary {
  cashEntry: boolean;
  destinationAfter: { cost: number; quantity: string };
  originAfter: { quantity: string };
  // The destination's fraction sale that goes with the conversion (FR 20), when there is one.
  sale?: { amount: number; date: string; quantity: string };
  saleHasEntry: boolean;
}

// Spec 112 section 8: "Converter em outro ativo" is for active, listed assets that still hold a position.
export function canConvert(asset: InvestmentAssetDetail): boolean {
  return (
    asset.status === "ACTIVE" &&
    asset.assetClass !== InvestmentAssetClass.FIXED_INCOME &&
    (parseDecimal(asset.position.quantity) ?? ZERO) > ZERO
  );
}

// What deleting the conversion removes and the positions it leaves (artboard "Apagar conversão").
export function conversionDeleteSummary(
  conversion: InvestmentConversion,
  destination: InvestmentAssetDetail,
  origin: InvestmentAssetDetail,
): ConversionDeleteSummary {
  const sale = destination.operations.find(
    (operation) =>
      operation.fractionOfOperationId === conversion.to.operationId,
  );
  const out = origin.operations.find(
    (operation) => operation.type === InvestmentOperationType.CONVERSION_OUT,
  );

  return {
    cashEntry: !!out?.transactionId,
    destinationAfter: {
      cost:
        destination.position.cost -
        (conversion.to.cost - conversion.to.fractionCost),
      quantity: formatDecimal(
        (parseDecimal(destination.position.quantity) ?? ZERO) -
          (parseDecimal(conversion.to.quantity) ?? ZERO),
      ),
    },
    originAfter: { quantity: conversion.from.quantity },
    sale: sale
      ? { amount: sale.gross, date: sale.date, quantity: sale.quantity }
      : undefined,
    saleHasEntry: !!sale?.transactionId,
  };
}

// The quotas that come in and the fraction left, computed from the stored OUT snapshot (the origin page has no IN row).
export function conversionOutcome(
  asset: InvestmentAssetDetail,
  operation: InvestmentOperation,
) {
  const info = operation.conversion;

  if (!info || operation.type !== InvestmentOperationType.CONVERSION_OUT) {
    return undefined;
  }

  return previewConversion({
    assetClass: asset.assetClass,
    destination: null,
    origin: {
      cost: operation.conversionCost ?? 0,
      quantity: operation.quantity,
    },
    ratioFrom: info.ratioFrom,
    ratioTo: info.ratioTo,
  });
}

export function isConversionOperation(operation: InvestmentOperation): boolean {
  return isInvestmentConversion(operation.type);
}
