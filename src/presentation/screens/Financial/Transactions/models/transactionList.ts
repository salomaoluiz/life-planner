import TransactionUIModel from "./TransactionUIModel";

export const ALL_FILTER = "ALL";
const OWNER_PREFIX = "OWNER:";

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
  | { item: TransactionUIModel; key: string; kind: "item" };

function applyFilter(items: TransactionUIModel[], filter: string) {
  if (filter === "EXPENSE") {
    return items.filter((item) => item.isExpense);
  }
  if (filter === "INCOME") {
    return items.filter((item) => !item.isExpense);
  }
  if (filter.startsWith(OWNER_PREFIX)) {
    const ownerId = filter.slice(OWNER_PREFIX.length);

    return items.filter((item) => item.ownerId === ownerId);
  }

  return items;
}

function buildEntries(items: TransactionUIModel[], now: Date): ListEntry[] {
  const sorted = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
  const entries: ListEntry[] = [];
  let currentKey: string | undefined;
  let headerIndex = -1;

  sorted.forEach((item) => {
    if (item.dateKey !== currentKey) {
      currentKey = item.dateKey;
      const day = startOfDay(item.date);
      headerIndex = entries.length;
      entries.push({
        day,
        key: `header-${item.dateKey}`,
        kind: "header",
        label: resolveDayLabel(day, now),
        netCents: 0,
      });
    }

    const header = entries[headerIndex];
    if (header.kind === "header") {
      header.netCents += item.signedCents;
    }
    entries.push({ item, key: `item-${item.id}`, kind: "item" });
  });

  return entries;
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

function ownerFilter(ownerId: string) {
  return `${OWNER_PREFIX}${ownerId}`;
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
  applyFilter,
  buildEntries,
  formatDayTitle,
  formatMonthLabel,
  isInMonth,
  monthChoices,
  netAmount,
  ownerFilter,
  resolveDayLabel,
  shiftMonth,
  startOfMonth,
  stickyIndices,
};
