import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

type CardEntry =
  | { card: CreditCardDTO; key: string; kind: "archivedRow" }
  | { cardId: string; invoice: InvoiceDTO; key: string; kind: "invoice" }
  | { count: number; expanded: boolean; key: string; kind: "archivedToggle" }
  | { key: string; kind: "noClosed" }
  | { key: string; kind: "noUpcoming" };

interface CardsAggregate {
  available: number;
  totalLimit: number;
  used: number;
}

type InvoiceTab = "closed" | "open" | "upcoming";

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

// Rows under the carousel: the selected card's invoices (open or closed tab), then the collapsed Archived section.
function buildCardEntries(params: {
  archived: CreditCardDTO[];
  archivedExpanded: boolean;
  invoiceTab: InvoiceTab;
  selected?: CreditCardSummaryDTO;
}): CardEntry[] {
  const entries: CardEntry[] = [];
  const { selected } = params;

  if (selected && params.invoiceTab === "open") {
    entries.push({
      cardId: selected.card.id,
      invoice: selected.openInvoice,
      key: `invoice-${selected.card.id}-${selected.openInvoice.referenceMonth}`,
      kind: "invoice",
    });
  }
  if (selected && params.invoiceTab === "closed") {
    if (selected.closedInvoices.length === 0) {
      entries.push({ key: "no-closed", kind: "noClosed" });
    }
    selected.closedInvoices.forEach((invoice) =>
      entries.push({
        cardId: selected.card.id,
        invoice,
        key: `invoice-${selected.card.id}-${invoice.referenceMonth}`,
        kind: "invoice",
      }),
    );
  }
  if (selected && params.invoiceTab === "upcoming") {
    if (selected.upcomingInvoices.length === 0) {
      entries.push({ key: "no-upcoming", kind: "noUpcoming" });
    }
    selected.upcomingInvoices.forEach((invoice) =>
      entries.push({
        cardId: selected.card.id,
        invoice,
        key: `invoice-${selected.card.id}-${invoice.referenceMonth}`,
        kind: "invoice",
      }),
    );
  }
  if (params.archived.length > 0) {
    entries.push({
      count: params.archived.length,
      expanded: params.archivedExpanded,
      key: "archived-toggle",
      kind: "archivedToggle",
    });
    if (params.archivedExpanded) {
      params.archived.forEach((card) =>
        entries.push({ card, key: `archived-${card.id}`, kind: "archivedRow" }),
      );
    }
  }

  return entries;
}

// "All" leaves out the archived families (spec 042); selecting one shows its data.
function filterCardsByOwner(
  cards: CreditCardDTO[],
  ownerFilter: string,
  archivedOwnerIds: ReadonlySet<string> = new Set(),
) {
  if (ownerFilter === ALL_OWNERS) {
    return archivedOwnerIds.size === 0
      ? cards
      : cards.filter((card) => !archivedOwnerIds.has(card.ownerId));
  }

  return cards.filter((card) => card.ownerId === ownerFilter);
}

function filterSummariesByOwner(
  summaries: CreditCardSummaryDTO[],
  ownerFilter: string,
  archivedOwnerIds: ReadonlySet<string> = new Set(),
) {
  if (ownerFilter === ALL_OWNERS) {
    return archivedOwnerIds.size === 0
      ? summaries
      : summaries.filter((item) => !archivedOwnerIds.has(item.card.ownerId));
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

export type { CardEntry, CardsAggregate, InvoiceTab };
export {
  aggregateOf,
  amountProps,
  buildCardEntries,
  filterCardsByOwner,
  filterSummariesByOwner,
  formatDayMonth,
  formatReferenceMonth,
  resolveSelectedId,
  usedProgress,
};
