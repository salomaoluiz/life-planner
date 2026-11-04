import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { MonthSummary } from "@application/dto/home/MonthSummaryDTO";

import CardInvoiceUIModel from "./CardInvoiceUIModel";
import { DayBalanceView, ProjectedInvoiceGroup } from "./transactionList";
import TransactionUIModel from "./TransactionUIModel";

// Spec 080: the whole month of the screen from one request. The rows are the account rows; card purchases live on
// their invoice.
interface MonthData extends TransactionsData {
  balances: Map<string, DayBalanceView>;
  invoices: CardInvoiceUIModel[];
  projections: ProjectedData;
  summary: MonthSummary;
}

// What the API projects for the months after the current one (spec 034 FR 14).
interface ProjectedData {
  accountItems: TransactionUIModel[];
  cardGroups: ProjectedInvoiceGroup[];
}

// What the Transactions screen caches for one month (spec 075): the rows and the categories that color them
// (spec 061: lets a row that is still being saved show its category color and icon).
interface TransactionsData {
  categories?: CategoryDTO[];
  items: TransactionUIModel[];
}

export type { MonthData, ProjectedData, TransactionsData };
