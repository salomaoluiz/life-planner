import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import {
  deriveBreakdown,
  projectedEndOfMonth,
} from "@domain/entities/home/balanceProjection";
import { decimalToCents } from "@utils/money";

// The projected end-of-month balance and what it is made of (spec 062 FR 4-7). With a favorite account (spec 094 FR 28)
// everything is about that account: its balance on the last day, its rows and the invoices it still pays; the total of
// the filter stays available as a muted line.
class FinanceBalanceUIModel {
  get breakdown() {
    if (this.favorite) {
      return deriveBreakdown({
        currentCents: decimalToCents(this.favorite.balance),
        projectedEndCents: this.projectedEndCents,
        toPayCents: this.favoriteRows.toPay,
        toReceiveCents: this.favoriteRows.toReceive,
      });
    }

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
    if (!this.favorite) {
      return this.summary.expense;
    }

    // The daily balances know the invoices the favorite still pays; its rows do not: the difference is that part.
    const openInvoices = Math.max(
      0,
      this.breakdown.toPayCents - this.favoriteRows.toPay,
    );

    return this.favoriteRows.expense + openInvoices;
  }

  get favoriteName() {
    return this.favorite?.name;
  }

  get hasAccounts() {
    return this.balances.accounts.length > 0;
  }

  get income() {
    return this.favorite ? this.favoriteRows.income : this.summary.income;
  }

  get monthName() {
    return new Intl.DateTimeFormat(this.languageTag, { month: "long" }).format(
      this.month,
    );
  }

  get projectedEndCents() {
    return this.favorite
      ? this.favoriteEndCents
      : (projectedEndOfMonth(this.balances.days) ?? 0);
  }

  get projectedType(): "EXPENSE" | undefined {
    return this.projectedEndCents < 0 ? "EXPENSE" : undefined;
  }

  get projectedValue() {
    return Math.abs(this.projectedEndCents);
  }

  // The 062 number: the total of every account of the filter at the end of the month.
  get totalProjectedCents() {
    return projectedEndOfMonth(this.balances.days) ?? 0;
  }

  private readonly accounts: AccountDTO[];

  private get favoriteEndCents() {
    const days = this.balances.days;
    const last = days.reduce<(typeof days)[number] | undefined>(
      (latest, day) => (!latest || day.date > latest.date ? day : latest),
      undefined,
    );

    return (
      last?.accounts.find((item) => item.accountId === this.favorite?.id)
        ?.balanceCents ?? 0
    );
  }

  private get favoriteRows() {
    return (
      this.summary.byAccount[this.favorite?.id ?? ""] ?? {
        expense: 0,
        income: 0,
        toPay: 0,
        toReceive: 0,
      }
    );
  }

  constructor(
    private readonly summary: MonthSummaryDTO,
    private readonly balances: DailyBalanceDTO,
    accounts: AccountDTO[],
    private readonly month: Date,
    private readonly languageTag: string,
    private readonly favorite?: AccountDTO,
  ) {
    // Only the accounts the balances cover: the same set the filter and the archive rules chose.
    const ids = new Set(balances.accounts.map((account) => account.id));

    this.accounts = accounts.filter((account) => ids.has(account.id));
  }
}

export default FinanceBalanceUIModel;
