// Integer cents.
export interface MonthSummary {
  balance: number;
  expense: number;
  income: number;
}

class MonthSummaryDTO implements MonthSummary {
  balance: number;
  expense: number;
  income: number;

  constructor(params: MonthSummary) {
    this.balance = params.balance;
    this.expense = params.expense;
    this.income = params.income;
  }
}

export default MonthSummaryDTO;
