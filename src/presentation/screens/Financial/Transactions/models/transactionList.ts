import CardInvoiceUIModel from "./CardInvoiceUIModel";
import TransactionUIModel from "./TransactionUIModel";

export const ALL_FILTER = "ALL";
export type DayLabel =
  | { date: Date; kind: "date" }
  | { kind: "today" }
  | { kind: "yesterday" };

export type ListEntry =
  | {
      day: Date;
      key: string;
      kind: "header";
      label: DayLabel;
      netCents: number;
    }
  | { invoice: CardInvoiceUIModel; key: string; kind: "invoice" }
  | { item: TransactionUIModel; key: string; kind: "item" };

export type TypeFilter = "ALL" | "EXPENSE" | "INCOME";

// Account rows and card invoice lines share the day sections: an invoice sits on its list day.
function buildEntries(
  items: TransactionUIModel[],
  now: Date,
  invoices: CardInvoiceUIModel[] = [],
): ListEntry[] {
  const rows = [
    ...items.map((item) => ({
      date: item.date,
      dateKey: item.dateKey,
      entry: { item, key: `item-${item.id}`, kind: "item" } as const,
      signedCents: item.signedCents,
    })),
    ...invoices.map((invoice) => ({
      date: invoice.listDate,
      dateKey: invoice.dateKey,
      entry: {
        invoice,
        key: `invoice-${invoice.id}`,
        kind: "invoice",
      } as const,
      signedCents: invoice.signedCents,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  const entries: ListEntry[] = [];
  let currentKey: string | undefined;
  let headerIndex = -1;

  rows.forEach((row) => {
    if (row.dateKey !== currentKey) {
      currentKey = row.dateKey;
      const day = startOfDay(row.date);
      headerIndex = entries.length;
      entries.push({
        day,
        key: `header-${row.dateKey}`,
        kind: "header",
        label: resolveDayLabel(day, now),
        netCents: 0,
      });
    }

    const header = entries[headerIndex];
    if (header.kind === "header") {
      header.netCents += row.signedCents;
    }
    entries.push(row.entry);
  });

  return entries;
}

function filterByOwner(items: TransactionUIModel[], ownerFilter: string) {
  if (ownerFilter === ALL_FILTER) {
    return items;
  }

  return items.filter((item) => item.ownerId === ownerFilter);
}

function filterByType(items: TransactionUIModel[], typeFilter: TypeFilter) {
  if (typeFilter === "EXPENSE") {
    return items.filter((item) => item.isExpense);
  }
  if (typeFilter === "INCOME") {
    return items.filter((item) => !item.isExpense);
  }

  return items;
}

function filterInvoicesByOwner(
  invoices: CardInvoiceUIModel[],
  ownerFilter: string,
) {
  if (ownerFilter === ALL_FILTER) {
    return invoices;
  }

  return invoices.filter((invoice) => invoice.ownerId === ownerFilter);
}

// Card invoices are expenses: the Income filter hides them.
function filterInvoicesByType(
  invoices: CardInvoiceUIModel[],
  typeFilter: TypeFilter,
) {
  return typeFilter === "INCOME" ? [] : invoices;
}

// "Wed, 30 Sep": weekday, day-first, short month, in the active language.
function formatDayTitle(day: Date, languageTag: string) {
  const weekday = new Intl.DateTimeFormat(languageTag, {
    weekday: "short",
  }).format(day);
  const month = new Intl.DateTimeFormat(languageTag, { month: "short" }).format(
    day,
  );

  return `${weekday}, ${day.getDate()} ${month}`;
}

function formatMonthLabel(month: Date, languageTag: string) {
  return new Intl.DateTimeFormat(languageTag, {
    month: "long",
    year: "numeric",
  }).format(month);
}

function formatMonthName(month: Date, languageTag: string) {
  return new Intl.DateTimeFormat(languageTag, { month: "long" }).format(month);
}

function isInMonth(date: Date, month: Date) {
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function monthChoices(languageTag: string) {
  const formatter = new Intl.DateTimeFormat(languageTag, { month: "long" });

  return Array.from({ length: 12 }, (_, index) => ({
    label: formatter.format(new Date(2026, index, 1)),
    value: String(index),
  }));
}

function netAmount(netCents: number): {
  type?: "EXPENSE" | "INCOME";
  value: number;
} {
  if (netCents === 0) {
    return { value: 0 };
  }

  return {
    type: netCents < 0 ? "EXPENSE" : "INCOME",
    value: Math.abs(netCents),
  };
}

function resolveDayLabel(day: Date, now: Date): DayLabel {
  const today = startOfDay(now);
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const target = startOfDay(day);

  if (target.getTime() === today.getTime()) {
    return { kind: "today" };
  }
  if (target.getTime() === yesterday.getTime()) {
    return { kind: "yesterday" };
  }

  return { date: target, kind: "date" };
}

function shiftMonth(month: Date, delta: number) {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function stickyIndices(entries: ListEntry[]) {
  return entries.flatMap((entry, index) =>
    entry.kind === "header" ? [index] : [],
  );
}

export {
  buildEntries,
  filterByOwner,
  filterByType,
  filterInvoicesByOwner,
  filterInvoicesByType,
  formatDayTitle,
  formatMonthLabel,
  formatMonthName,
  isInMonth,
  monthChoices,
  netAmount,
  resolveDayLabel,
  shiftMonth,
  startOfMonth,
  stickyIndices,
};
