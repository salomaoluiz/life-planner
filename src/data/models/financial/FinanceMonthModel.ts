import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";

import CardInvoiceModel from "./CardInvoiceModel";
import DailyBalanceModel from "./DailyBalanceModel";
import ProjectedOccurrenceModel from "./ProjectedOccurrenceModel";
import TransactionModel, { TransactionLookups } from "./TransactionModel";

// Spec 080: money in cents. `income/expense/toPay/toReceive` are the real figures of the month; the projected pair is
// what the series still add to a month after the current one.
interface FinanceMonthSummaryModel {
  currency?: CurrencyCode;
  expense: number;
  income: number;
  projectedExpense: number;
  projectedIncome: number;
  toPay: number;
  toReceive: number;
}

// API shape of `GET /v1/finance/month` joined into the models the separate endpoints produce. `nextCursor` is what is
// left of the account rows after the first page.
class FinanceMonthModel {
  dailyBalances: DailyBalanceModel;
  invoices: CardInvoiceModel[];
  nextCursor: null | string;
  projections: ProjectedOccurrenceModel[];
  summary: FinanceMonthSummaryModel;
  transactions: TransactionModel[];

  constructor(params: {
    dailyBalances: DailyBalanceModel;
    invoices: CardInvoiceModel[];
    nextCursor: null | string;
    projections: ProjectedOccurrenceModel[];
    summary: FinanceMonthSummaryModel;
    transactions: TransactionModel[];
  }) {
    this.dailyBalances = params.dailyBalances;
    this.invoices = params.invoices;
    this.nextCursor = params.nextCursor;
    this.projections = params.projections;
    this.summary = params.summary;
    this.transactions = params.transactions;
  }

  static empty(month: string): FinanceMonthModel {
    return new FinanceMonthModel({
      dailyBalances: new DailyBalanceModel({ accounts: [], days: [], month }),
      invoices: [],
      nextCursor: null,
      projections: [],
      summary: {
        currency: DEFAULT_CURRENCY,
        expense: 0,
        income: 0,
        projectedExpense: 0,
        projectedIncome: 0,
        toPay: 0,
        toReceive: 0,
      },
      transactions: [],
    });
  }

  static fromJSON(data: Record<string, unknown>): FinanceMonthModel {
    const rows = data.rows as {
      items: Record<string, unknown>[];
      nextCursor: null | string;
    };
    const summary = data.summary as Record<string, number>;

    return new FinanceMonthModel({
      dailyBalances: DailyBalanceModel.fromJSON(
        data.dailyBalances as Record<string, unknown>,
      ),
      invoices: (data.invoices as Record<string, unknown>[]).map((item) =>
        CardInvoiceModel.fromJSON(item),
      ),
      nextCursor: rows.nextCursor,
      projections: (data.projections as Record<string, unknown>[]).map((item) =>
        ProjectedOccurrenceModel.fromJSON(item),
      ),
      summary: {
        currency: toCurrencyCode(
          (data.summary as { currency?: unknown }).currency,
        ),
        expense: summary.expense,
        income: summary.income,
        projectedExpense: summary.projectedExpense,
        projectedIncome: summary.projectedIncome,
        toPay: summary.toPay,
        toReceive: summary.toReceive,
      },
      transactions: rows.items.map((item) =>
        TransactionModel.fromLeanJSON(
          item,
          data.lookups as Partial<TransactionLookups>,
        ),
      ),
    });
  }
}

export default FinanceMonthModel;
export type { FinanceMonthSummaryModel };
