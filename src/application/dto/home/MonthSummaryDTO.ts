// Integer cents. What the account rows of one account made in the month (spec 094): the favorite account's own numbers.
export interface AccountMonthTotals {
  expense: number;
  income: number;
  toPay: number;
  toReceive: number;
}

export interface MonthSummary {
  balance: number;
  // By account id: account rows plus the invoices paid from the account. Card purchases never count one by one.
  byAccount?: Record<string, AccountMonthTotals>;
  expense: number;
  income: number;
  // Occurrences of recurring series projected for this month (spec 034 FR 15): zero in the current and past months.
  projectedExpense?: number;
  projectedIncome?: number;
  // Still open this month: unpaid account rows and unpaid card invoices (spec 033).
  toPay: number;
  toReceive: number;
}

class MonthSummaryDTO implements MonthSummary {
  balance: number;
  byAccount: Record<string, AccountMonthTotals>;
  expense: number;
  income: number;
  projectedExpense: number;
  projectedIncome: number;
  toPay: number;
  toReceive: number;

  constructor(params: MonthSummary) {
    this.balance = params.balance;
    this.byAccount = params.byAccount ?? {};
    this.expense = params.expense;
    this.income = params.income;
    this.projectedExpense = params.projectedExpense ?? 0;
    this.projectedIncome = params.projectedIncome ?? 0;
    this.toPay = params.toPay;
    this.toReceive = params.toReceive;
  }
}

export default MonthSummaryDTO;
