import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";

const DAY_MS = 86_400_000;
const MINUS = "−";

export type QuotesWhenKind = "date" | "today" | "yesterday";

// The portfolio, income and next maturity of the home (spec 109). Money stays in cents: the cards format it.
class InvestmentsSummaryUIModel {
  get currentValueCents() {
    return this.dto.currentValueCents;
  }

  get footer() {
    const { asOf, manualCount, stale } = this.dto.quotes;

    return { manualCount, stale, when: asOf ? this.when(asOf) : undefined };
  }

  get income() {
    const { count, month, pendingSuggestions, totalCents } = this.dto.income;
    const [year, number] = month.split("-").map(Number);

    return {
      count,
      isEmpty: count === 0,
      monthName: new Intl.DateTimeFormat(this.languageTag, {
        month: "long",
      }).format(new Date(year, number - 1, 1)),
      pendingSuggestions,
      totalCents,
    };
  }

  get investedCents() {
    return this.dto.investedCents;
  }

  get isEmpty() {
    return !this.dto.hasPositions;
  }

  get maturity() {
    const maturity = this.dto.nextMaturity;

    if (!maturity) {
      return undefined;
    }

    const [year, month, day] = maturity.maturityDate.split("-").map(Number);

    return {
      assetId: maturity.assetId,
      currency: maturity.currency,
      dateLabel: new Intl.DateTimeFormat(this.languageTag, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(year, month - 1, day)),
      days: Math.round(
        (Date.UTC(year, month - 1, day) - this.todayUtc) / DAY_MS,
      ),
      name: maturity.name,
      netEstimatedCents: maturity.netEstimatedCents,
    };
  }

  get resultCents() {
    return this.dto.resultCents;
  }

  // 1315 basis points = "+13,15%"; undefined when there is no cost to compare with.
  get resultPercent() {
    const points = this.dto.resultBasisPoints;

    if (points === undefined) {
      return undefined;
    }

    return new Intl.NumberFormat(this.languageTag, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      signDisplay: "exceptZero",
      style: "percent",
    })
      .format(points / 10000)
      .replace("-", MINUS);
  }

  get resultTone(): "expense" | "income" {
    return this.dto.resultCents >= 0 ? "income" : "expense";
  }

  private get todayUtc() {
    return Date.UTC(
      this.now.getFullYear(),
      this.now.getMonth(),
      this.now.getDate(),
    );
  }

  constructor(
    private readonly dto: InvestmentsHomeSummary,
    private readonly now: Date,
    private readonly languageTag: string,
  ) {}

  private when(asOf: Date): {
    date: string;
    kind: QuotesWhenKind;
    time: string;
  } {
    const days = Math.round(
      (this.todayUtc -
        Date.UTC(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())) /
        DAY_MS,
    );

    return {
      date: new Intl.DateTimeFormat(this.languageTag, {
        day: "numeric",
        month: "short",
      }).format(asOf),
      kind: whenKind(days),
      time: new Intl.DateTimeFormat(this.languageTag, {
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
      }).format(asOf),
    };
  }
}

function whenKind(daysAgo: number): QuotesWhenKind {
  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";

  return "date";
}

export default InvestmentsSummaryUIModel;
