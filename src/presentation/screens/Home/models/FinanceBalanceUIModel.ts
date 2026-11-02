import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import {
  deriveBreakdown,
  projectedEndOfMonth,
} from "@domain/entities/home/balanceProjection";
import { decimalToCents } from "@utils/money";

// The projected end-of-month balance and what it is made of (spec 062 FR 4-7).
class FinanceBalanceUIModel {
  get breakdown() {
    return deriveBreakdown({
      currentCents: this.accounts.reduce(
        (sum, account) => sum + decimalToCents(account.balance),
        0,
      ),
      projectedEndCents: this.projectedEndCents,
      toPayCents: this.summary.toPay,
      toReceiveCents: this.summary.toReceive,
    });
  }

  get expense() {
    return this.summary.expense;
  }

  get hasAccounts() {
    return this.balances.accounts.length > 0;
  }

  get income() {
    return this.summary.income;
  }

  get monthName() {
    return new Intl.DateTimeFormat(this.languageTag, { month: "long" }).format(
      this.month,
    );
  }

  get projectedEndCents() {
    return projectedEndOfMonth(this.balances.days) ?? 0;
  }

  get projectedType(): "EXPENSE" | undefined {
    return this.projectedEndCents < 0 ? "EXPENSE" : undefined;
  }

  get projectedValue() {
    return Math.abs(this.projectedEndCents);
  }

  private readonly accounts: AccountDTO[];

  constructor(
    private readonly summary: MonthSummaryDTO,
    private readonly balances: DailyBalanceDTO,
    accounts: AccountDTO[],
    private readonly month: Date,
    private readonly languageTag: string,
  ) {
    // Only the accounts the balances cover: the same set the filter and the archive rules chose.
    const ids = new Set(balances.accounts.map((account) => account.id));

    this.accounts = accounts.filter((account) => ids.has(account.id));
  }
}

export default FinanceBalanceUIModel;
