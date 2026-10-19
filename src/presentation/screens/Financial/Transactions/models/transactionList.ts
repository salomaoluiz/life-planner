import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { InvoiceDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import CardInvoiceUIModel from "./CardInvoiceUIModel";
import TransactionUIModel from "./TransactionUIModel";

export const ALL_FILTER = "ALL";

// End-of-day balance of one day (spec 035): the aggregate and one line per account.
export interface DayBalanceView {
  accounts: {
    accountId: string;
    balanceCents: number;
    icon: string;
    name: string;
  }[];
  cardsDueCents: number;
  projected: boolean;
  totalCents: number;
}
export type DayLabel =
  | { date: Date; kind: "date" }
  | { kind: "today" }
  | { kind: "yesterday" };
export type ListEntry =
  | {
      accountId?: string;
      balanceCents: number;
      dateKey: string;
      icon: string;
      isCards: boolean;
      key: string;
      kind: "balanceLine";
      name: string;
    }
  | {
      balanceCents?: number;
      dateKey: string;
      day: Date;
      key: string;
      kind: "header";
      label: DayLabel;
      netCents: number;
      projected?: boolean;
    }
  | { invoice: CardInvoiceUIModel; key: string; kind: "invoice" }
  | { item: TransactionUIModel; key: string; kind: "item" };

// Projected card purchases that would land on one invoice (spec 034 FR 14).
export interface ProjectedInvoiceGroup {
  card: {
    color: string;
    id: string;
    lastDigits?: string;
    owner: OwnerType;
    ownerId: string;
    title: string;
  };
  items: TransactionUIModel[];
  // `YYYY-MM-DD` the invoice appears in the list.
  listDate: string;
  // `YYYY-MM`
  referenceMonth: string;
}

export type TypeFilter = "ALL" | "EXPENSE" | "INCOME";

// One line per account (API order), plus the card invoices line only when it is not zero.
function balanceLines(dateKey: string, balance: DayBalanceView): ListEntry[] {
  const lines: ListEntry[] = balance.accounts.map((account) => ({
    accountId: account.accountId,
    balanceCents: account.balanceCents,
    dateKey,
    icon: account.icon,
    isCards: false,
    key: `balance-${dateKey}-${account.accountId}`,
    kind: "balanceLine",
    name: account.name,
  }));

  if (balance.cardsDueCents !== 0) {
    lines.push({
      balanceCents: balance.cardsDueCents,
      dateKey,
      icon: "credit-card-outline",
      isCards: true,
      key: `balance-${dateKey}-cards`,
      kind: "balanceLine",
      name: "",
    });
  }

  return lines;
}

// Account rows and card invoice lines share the day sections: an invoice sits on its list day.
function buildEntries(
  items: TransactionUIModel[],
  now: Date,
  invoices: CardInvoiceUIModel[] = [],
  options: {
    balances?: Map<string, DayBalanceView>;
    expandedDateKey?: string;
  } = {},
): ListEntry[] {
  const rows = [
    ...items.map((item) => ({
      date: item.date,
      dateKey: item.dateKey,
      entry: { item, key: `item-${item.id}`, kind: "item" } as const,
      // A projection is a preview: it never moves the net of the day.
      signedCents: item.isProjected ? 0 : item.signedCents,
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
      const balance = options.balances?.get(row.dateKey);

      entries.push({
        balanceCents: balance?.totalCents,
        dateKey: row.dateKey,
        day,
        key: `header-${row.dateKey}`,
        kind: "header",
        label: resolveDayLabel(day, now),
        netCents: 0,
        projected: balance?.projected,
      });
      if (balance && options.expandedDateKey === row.dateKey) {
        entries.push(...balanceLines(row.dateKey, balance));
      }
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

// The real invoices of the month, each carrying its projected purchases, plus an invoice line for the
// projections whose invoice has no real purchase yet.
function mergeProjectedInvoices(
  invoices: CardInvoiceUIModel[],
  groups: ProjectedInvoiceGroup[],
) {
  const used = new Set<string>();
  const merged = invoices.map((invoice) => {
    const group = groups.find(
      (item) =>
        item.card.id === invoice.cardId &&
        item.referenceMonth === invoice.referenceMonth,
    );

    if (!group) {
      return invoice;
    }
    used.add(`${group.card.id}:${group.referenceMonth}`);

    return invoice.withProjected(group.items);
  });
  const only = groups
    .filter((group) => !used.has(`${group.card.id}:${group.referenceMonth}`))
    .map((group) => projectedOnlyInvoice(group));

  return [...merged, ...only];
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

// A projected-only invoice: no real purchases yet, so the line only carries the projected ones.
function projectedOnlyInvoice(group: ProjectedInvoiceGroup) {
  const dto = new CardInvoiceDTO({
    card: { ...group.card },
    invoice: new InvoiceDTO({
      amount: 0,
      amountDue: 0,
      carryIn: 0,
      closingDate: group.listDate,
      dueDate: group.listDate,
      earlyPaid: 0,
      listDate: group.listDate,
      net: 0,
      paymentAfterDue: false,
      paymentDate: group.listDate,
      periodEnd: group.listDate,
      periodStart: group.listDate,
      referenceMonth: group.referenceMonth,
      status: "OPEN",
      total: 0,
    }),
    purchases: [],
  });

  return new CardInvoiceUIModel(dto, group.items);
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

// The API days by `YYYY-MM-DD`, with the account names joined in.
function toDayBalanceViews(dto: DailyBalanceDTO): Map<string, DayBalanceView> {
  const accountById = new Map(
    dto.accounts.map((account) => [account.id, account]),
  );

  return new Map(
    dto.days.map((day) => [
      day.date,
      {
        accounts: day.accounts.map((item) => ({
          accountId: item.accountId,
          balanceCents: item.balanceCents,
          icon: accountById.get(item.accountId)?.icon ?? "bank",
          name: accountById.get(item.accountId)?.name ?? "",
        })),
        cardsDueCents: day.cardsDueCents,
        projected: day.projected,
        totalCents: day.totalCents,
      },
    ]),
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
  mergeProjectedInvoices,
  monthChoices,
  netAmount,
  resolveDayLabel,
  shiftMonth,
  startOfMonth,
  stickyIndices,
  toDayBalanceViews,
};
