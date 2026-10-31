import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { lowestBalanceDay } from "@domain/entities/home/balanceProjection";

export interface LowestBalanceLine {
  accountId: string;
  balanceCents: number;
  icon: string;
  name: string;
}

export interface LowestBalanceTile {
  dateLabel: string;
  day: number;
  id: "current" | "next";
  isNegative: boolean;
  lines: LowestBalanceLine[];
  monthName: string;
  totalCents: number;
}

// The two "lowest balance day" tiles: this month from today on, next month whole (spec 062 FR 8-9).
class LowestBalanceUIModel {
  get hasAccounts() {
    return this.current.accounts.length > 0;
  }

  get tiles(): LowestBalanceTile[] {
    if (!this.hasAccounts) {
      return [];
    }

    const today = toDateKey(this.now);
    const tiles = [
      this.tile("current", this.current, today),
      this.tile("next", this.next, "0000-00-00"),
    ];

    return tiles.filter((tile): tile is LowestBalanceTile => !!tile);
  }

  constructor(
    private readonly current: DailyBalanceDTO,
    private readonly next: DailyBalanceDTO,
    private readonly now: Date,
    private readonly languageTag: string,
  ) {}

  private tile(
    id: "current" | "next",
    balances: DailyBalanceDTO,
    fromDate: string,
  ): LowestBalanceTile | undefined {
    const lowest = lowestBalanceDay(balances.days, fromDate);

    if (!lowest) {
      return undefined;
    }

    const date = new Date(`${lowest.date}T12:00:00`);

    return {
      dateLabel: new Intl.DateTimeFormat(this.languageTag, {
        day: "numeric",
        month: "short",
      }).format(date),
      day: date.getDate(),
      id,
      isNegative: lowest.totalCents < 0,
      lines: balances.accounts.map((account) => ({
        accountId: account.id,
        balanceCents:
          lowest.accounts.find((item) => item.accountId === account.id)
            ?.balanceCents ?? 0,
        icon: account.icon,
        name: account.name,
      })),
      monthName: new Intl.DateTimeFormat(this.languageTag, {
        month: "long",
      }).format(date),
      totalCents: lowest.totalCents,
    };
  }
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default LowestBalanceUIModel;
