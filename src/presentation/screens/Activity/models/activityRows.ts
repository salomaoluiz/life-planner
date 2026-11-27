import { formatAmount } from "@components/AmountText/formatAmount";
import { Tone } from "@components/utils/tones";
import {
  ActivityAction,
  ActivityEntryEntity,
} from "@domain/entities/activity/ActivityEntity";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";

import { ActivityTarget, targetOfEntry } from "./activityTarget";

export interface ActivityBuildContext {
  currentUserId: string;
  languageTag: string;
  showOwner: boolean;
  t: Translate;
  today: string;
}

export interface ActivityDayUI {
  key: string;
  label: string;
  rows: ActivityRowUI[];
}

export interface ActivityDiffUI {
  field: string;
  from: string;
  to: string;
}

export interface ActivityRowUI {
  assetId?: string;
  batchCount: number;
  diffs: ActivityDiffUI[];
  fileName?: string;
  gone: boolean;
  icon: string;
  id: string;
  isBatch: boolean;
  label: string;
  meta: string;
  // Spec 127 section 8: the booking date is far from the action date (a typo like 2022 stands out).
  metaWarning: boolean;
  ownerLabel: string;
  ownerName: string;
  target: ActivityTarget | null;
  time: string;
  tone: Tone;
  verb: string;
  who: string;
}

export type Translate = (
  key: TranslationKeys,
  options?: Record<string, unknown>,
) => string;

export const UNUSUAL_BOOKING_DAYS = 60;

const DAY_MS = 86_400_000;
const MONEY_FIELDS = new Set([
  "amountCents",
  "amountIn",
  "amountOut",
  "cashAmount",
  "discount",
  "fee",
  "fees",
  "initialBalance",
  "limit",
  "totalValue",
]);
const ICONS: Record<ActivityAction, { icon: string; tone: Tone }> = {
  CREATE: { icon: "plus", tone: "income" },
  DELETE: { icon: "trash-can-outline", tone: "expense" },
  UPDATE: { icon: "pencil-outline", tone: "accent" },
};

export function buildActivityDays(
  entries: ActivityEntryEntity[],
  context: ActivityBuildContext,
): ActivityDayUI[] {
  const days: ActivityDayUI[] = [];

  for (const entry of entries) {
    const key = localDay(entry.occurredAt);
    let day = days.find((candidate) => candidate.key === key);

    if (!day) {
      day = { key, label: dayLabel(key, context), rows: [] };
      days.push(day);
    }

    day.rows.push(toRow(entry, context));
  }

  return days;
}

export function fieldLabel(field: string, t: Translate): string {
  const key = `activity.field.${field}` as TranslationKeys;
  const label = t(key);

  // An unknown field falls back to its raw name (the i18n layer returns the key).
  return label === key ? field : label;
}

// Raw values (cents, ISO dates, enum keys, names) in the words of the reader.
export function formatChangeValue(
  field: string,
  value: unknown,
  context: Pick<ActivityBuildContext, "languageTag" | "t">,
  currency?: string,
): string {
  if (value === null || value === undefined || value === "") {
    return context.t("activity.none");
  }

  if (typeof value === "boolean") {
    return context.t(value ? "activity.yes" : "activity.no");
  }

  if (typeof value === "number" && MONEY_FIELDS.has(field)) {
    return formatMoney(value, currency, context.languageTag);
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    /(date|On)$/i.test(field)
  ) {
    return formatDate(value, context.languageTag);
  }

  if (Array.isArray(value)) {
    return value.length === 0
      ? context.t("activity.none")
      : value.map(String).join(", ");
  }

  return String(value);
}

export function formatDate(date: string, languageTag: string): string {
  return new Intl.DateTimeFormat(languageTag, { timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export function formatMoney(
  cents: number,
  currency: string | undefined,
  languageTag: string,
): string {
  return formatAmount(cents, languageTag, (currency ?? "BRL") as CurrencyCode);
}

export function isUnusualBooking(
  bookingDate: string | undefined,
  occurredAt: string,
): boolean {
  if (!bookingDate) {
    return false;
  }

  const booked = Date.parse(`${bookingDate}T00:00:00Z`);
  const done = Date.parse(occurredAt);

  return Math.abs(done - booked) > UNUSUAL_BOOKING_DAYS * DAY_MS;
}

// "Você" when the reader is the actor; the stored name otherwise (also for a deleted account).
export function whoOf(
  entry: ActivityEntryEntity,
  context: Pick<ActivityBuildContext, "currentUserId" | "t">,
): string {
  return entry.actor.id !== null && entry.actor.id === context.currentUserId
    ? context.t("activity.you")
    : entry.actor.name;
}

function dayLabel(key: string, context: ActivityBuildContext): string {
  const { languageTag, t, today } = context;

  if (key === today) {
    return t("common.date.today");
  }

  const yesterday = new Date(`${today}T12:00:00`);

  yesterday.setDate(yesterday.getDate() - 1);

  if (key === yesterday.toLocaleDateString("en-CA")) {
    return t("common.date.yesterday");
  }

  return new Intl.DateTimeFormat(languageTag, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
}

function metaOf(entry: ActivityEntryEntity, context: ActivityBuildContext) {
  const { languageTag, t } = context;
  const { summary } = entry;
  const parts: string[] = [];

  if (entry.batch) {
    parts.push(
      t(pluralKey("activity.items.count", entry.batchPreview?.count ?? 0), {
        count: entry.batchPreview?.count ?? 0,
      }),
    );

    if (typeof summary.extra?.fileName === "string") {
      parts.push(summary.extra.fileName);
    }
  }

  if (summary.amountCents !== undefined) {
    parts.push(formatMoney(summary.amountCents, summary.currency, languageTag));
  }

  if (summary.sources && summary.sources.length > 0) {
    parts.push(summary.sources.join(", "));
  }

  if (summary.bookingDate) {
    parts.push(
      t("activity.bookedOn", {
        date: formatDate(summary.bookingDate, languageTag),
      }),
    );
  }

  return parts.join(" · ");
}

function ownerName(entry: ActivityEntryEntity, t: Translate): string {
  return entry.owner.type === "USER"
    ? t("activity.personal")
    : entry.owner.name;
}

function toRow(
  entry: ActivityEntryEntity,
  context: ActivityBuildContext,
): ActivityRowUI {
  const { languageTag, t } = context;
  const { label, verb } = verbOf(entry, t);
  const style = entry.batch
    ? { icon: "format-list-bulleted", tone: "warning" as Tone }
    : ICONS[entry.action];

  const extra = entry.summary.extra ?? {};

  return {
    assetId: typeof extra.assetId === "string" ? extra.assetId : undefined,
    batchCount: entry.batchPreview?.count ?? 0,
    diffs: (entry.changes ?? []).map((change) => ({
      field: fieldLabel(change.field, t),
      from: formatChangeValue(
        change.field,
        change.from,
        context,
        entry.summary.currency,
      ),
      to: formatChangeValue(
        change.field,
        change.to,
        context,
        entry.summary.currency,
      ),
    })),
    fileName: typeof extra.fileName === "string" ? extra.fileName : undefined,
    gone: !entry.batch && !entry.itemExists && !!entry.entityId,
    icon: style.icon,
    id: entry.id,
    isBatch: entry.batch,
    label,
    meta: metaOf(entry, context),
    metaWarning: isUnusualBooking(entry.summary.bookingDate, entry.occurredAt),
    ownerLabel: context.showOwner ? ownerName(entry, t) : "",
    ownerName: ownerName(entry, t),
    target: targetOfEntry(entry),
    time: new Intl.DateTimeFormat(languageTag, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(entry.occurredAt)),
    tone: style.tone,
    verb,
    who: whoOf(entry, context),
  };
}

function verbOf(entry: ActivityEntryEntity, t: Translate) {
  const extra = entry.summary.extra ?? {};

  if (entry.entityType === "TRANSACTION_IMPORT") {
    return {
      label: "",
      verb: t("activity.verb.import", {
        count: entry.batchPreview?.count ?? 0,
      }),
    };
  }

  if (entry.entityType === "STOCK_PURCHASE_POSTING") {
    return {
      label: "",
      verb: t("activity.verb.closePurchase", { market: extra.market ?? "" }),
    };
  }

  if (entry.entityType === "OPERATION" && entry.action === "CREATE") {
    if (extra.operationType === "BUY") {
      return { label: entry.summary.label, verb: t("activity.verb.buy") };
    }
    if (extra.operationType === "SELL") {
      return { label: entry.summary.label, verb: t("activity.verb.sell") };
    }
  }

  const action = entry.action.toLowerCase() as "create" | "delete" | "update";

  return {
    label: entry.summary.label,
    verb: `${t(`activity.verb.${action}` as TranslationKeys)} ${t(
      `activity.entity.${entry.entityType}` as TranslationKeys,
    )}`,
  };
}
