// Integer cents.
export interface MonthSummary {
  balance: number;
  expense: number;
  income: number;
  // Still open this month: unpaid account rows and unpaid card invoices (spec 033).
  toPay: number;
  toReceive: number;
}

class MonthSummaryDTO implements MonthSummary {
  balance: number;
  expense: number;
  income: number;
  toPay: number;
  toReceive: number;

  constructor(params: MonthSummary) {
    this.balance = params.balance;
    this.expense = params.expense;
    this.income = params.income;
    this.toPay = params.toPay;
    this.toReceive = params.toReceive;
  }
}

export default MonthSummaryDTO;
