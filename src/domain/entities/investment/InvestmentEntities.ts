import { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
  InvestmentValuationSource,
} from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface InvestmentAsset {
  archivedAt: null | string;
  assetClass: InvestmentAssetClass;
  currency: CurrencyCode;
  id: string;
  name: string;
  operationCount: number;
  owner: OwnerType;
  ownerId: string;
  position: InvestmentPosition;
  status: InvestmentAssetStatus;
  ticker: null | string;
}

export interface InvestmentAssetDetail extends InvestmentAsset {
  operations: InvestmentOperation[];
  valuations: InvestmentValuation[];
}

// Money is integer cents in the asset currency; quantities and unit prices are decimal strings (up to 8 places).
export interface InvestmentFee {
  amount: number;
  description: null | string;
  id: string;
  kind: InvestmentFeeKind;
}

export interface InvestmentOperation {
  accountId: null | string;
  // Cost removed by a sell; null on a buy.
  costRemoved: null | number;
  date: string;
  fees: InvestmentFee[];
  feesTotal: number;
  generateTransaction: boolean;
  gross: number;
  id: string;
  quantity: string;
  // Realized result of a sell; null on a buy.
  realizedResult: null | number;
  total: number;
  transactionId: null | string;
  type: InvestmentOperationType;
  unitPrice: string;
}

export interface InvestmentOperationResult {
  operation: InvestmentOperation;
  position: InvestmentPosition;
}

export interface InvestmentPosition {
  averagePrice: null | string;
  cost: number;
  currentUnitPrice: null | string;
  currentValue: null | number;
  currentValueDate: null | string;
  openResult: null | number;
  // Fraction of the cost (0.0721 = 7.21%).
  openResultPercent: null | number;
  quantity: string;
  realizedResult: number;
}

export interface InvestmentValuation {
  date: string;
  id: string;
  source: InvestmentValuationSource;
  unitPrice: string;
}

export interface InvestmentValuationResult {
  position: InvestmentPosition;
  valuation: InvestmentValuation;
}
