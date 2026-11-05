import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { lowestBalanceDay } from "@domain/entities/home/balanceProjection";

export interface LowestBalanceLine {
  accountId: string;
  balanceCents: number;
  // Spec 094: the favorite account, listed first and highlighted.
  favorite: boolean;
  icon: string;
  name: string;
}

export interface LowestBalanceTile {
  dateLabel: string;
  day: number;
  // The total of the accounts of the filter on that day (spec 094): `totalCents` is the favorite's when there is one.
  filterTotalCents: number;
  id: "current" | "next";
  isNegative: boolean;
  lines: LowestBalanceLine[];
  monthName: string;
  totalCents: number;
}

// The two "lowest balance day" tiles: this month from today on, next month whole (spec 062 FR 8-9).
class LowestBalanceUIModel {
  get favoriteName() {
    return this.favorite?.name;
  }

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
    private readonly favorite?: { id: string; name: string },
  ) {}

  private tile(
    id: "current" | "next",
    balances: DailyBalanceDTO,
    fromDate: string,
  ): LowestBalanceTile | undefined {
    const lowest = lowestBalanceDay(
      this.favorite
        ? balances.days.map((day) => ({
            ...day,
            totalCents:
              day.accounts.find((item) => item.accountId === this.favorite?.id)
                ?.balanceCents ?? 0,
          }))
        : balances.days,
      fromDate,
    );

    if (!lowest) {
      return undefined;
    }

    const date = new Date(`${lowest.date}T12:00:00`);
    const filterTotalCents =
      balances.days.find((item) => item.date === lowest.date)?.totalCents ??
      lowest.totalCents;
    const lines = balances.accounts.map((account) => ({
      accountId: account.id,
      balanceCents:
        lowest.accounts.find((item) => item.accountId === account.id)
          ?.balanceCents ?? 0,
      favorite: account.id === this.favorite?.id,
      icon: account.icon,
      name: account.name,
    }));

    return {
      dateLabel: new Intl.DateTimeFormat(this.languageTag, {
        day: "numeric",
        month: "short",
      }).format(date),
      day: date.getDate(),
      filterTotalCents,
      id,
      isNegative: lowest.totalCents < 0,
      lines: lines.sort((x, y) => Number(y.favorite) - Number(x.favorite)),
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
