import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import { CreditCardSummaryDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

interface CardsAggregate {
  available: number;
  totalLimit: number;
  used: number;
}

// The aggregate follows the current scope filter, so it is derived from what is shown (FR 22).
function aggregateOf(summaries: CreditCardSummaryDTO[]): CardsAggregate {
  const totalLimit = summaries.reduce((sum, item) => sum + item.card.limit, 0);
  const used = summaries.reduce((sum, item) => sum + item.used, 0);

  return { available: totalLimit - used, totalLimit, used };
}

function amountProps(cents: number): { type?: "EXPENSE"; value: number } {
  if (cents < 0) {
    return { type: "EXPENSE", value: Math.abs(cents) };
  }

  return { value: cents };
}

function filterCardsByOwner(cards: CreditCardDTO[], ownerFilter: string) {
  if (ownerFilter === ALL_OWNERS) {
    return cards;
  }

  return cards.filter((card) => card.ownerId === ownerFilter);
}

function filterSummariesByOwner(
  summaries: CreditCardSummaryDTO[],
  ownerFilter: string,
) {
  if (ownerFilter === ALL_OWNERS) {
    return summaries;
  }

  return summaries.filter((item) => item.card.ownerId === ownerFilter);
}

// "2026-10-31" -> "31/10": parsed from the string, never through Date (no time-zone shift).
function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split("-");

  return `${day}/${month}`;
}

// "2026-10" -> "Oct 2026" in the user's language.
function formatReferenceMonth(referenceMonth: string, languageTag: string) {
  const [year, month] = referenceMonth.split("-").map(Number);

  return new Intl.DateTimeFormat(languageTag, {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function resolveSelectedId(
  summaries: CreditCardSummaryDTO[],
  selectedId?: string,
): string | undefined {
  if (summaries.some((item) => item.card.id === selectedId)) {
    return selectedId;
  }

  return summaries[0]?.card.id;
}

function usedProgress(aggregate: CardsAggregate): number {
  if (aggregate.totalLimit <= 0) {
    return 0;
  }

  return aggregate.used / aggregate.totalLimit;
}

export type { CardsAggregate };
export {
  aggregateOf,
  amountProps,
  filterCardsByOwner,
  filterSummariesByOwner,
  formatDayMonth,
  formatReferenceMonth,
  resolveSelectedId,
  usedProgress,
};
