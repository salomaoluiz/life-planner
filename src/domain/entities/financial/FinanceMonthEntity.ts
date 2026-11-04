import CardInvoiceEntity from "./CardInvoiceEntity";
import DailyBalanceEntity from "./DailyBalanceEntity";
import ProjectedOccurrenceEntity from "./ProjectedOccurrenceEntity";
import TransactionEntity from "./TransactionEntity";

// Spec 080: money in cents. The first four are the real figures of the month; the projected pair is what the series
// still add to a month after the current one.
export interface FinanceMonthSummaryEntity {
  expense: number;
  income: number;
  projectedExpense: number;
  projectedIncome: number;
  toPay: number;
  toReceive: number;
}

// Everything the transactions screen shows for one month: the account rows (card purchases live on their invoice).
interface FinanceMonthEntity {
  dailyBalances: DailyBalanceEntity;
  invoices: CardInvoiceEntity[];
  projections: ProjectedOccurrenceEntity[];
  summary: FinanceMonthSummaryEntity;
  transactions: TransactionEntity[];
}

export default FinanceMonthEntity;
