import {
  NotificationEntity,
  NotificationItemEntity,
  NotificationItemState,
} from "@domain/entities/notification/NotificationEntity";

export interface NoticeDay {
  key: string;
  label: string;
  rows: NoticeRow[];
}

export interface NoticeGroup {
  items: NoticeItemRow[];
  state: NotificationItemState;
}

export interface NoticeItemRow {
  detail: string;
  dueLabel: string;
  key: string;
  label: string;
  route: string;
  state: NotificationItemState;
  type: NotificationItemEntity["type"];
}

export interface NoticeRow {
  groups: NoticeGroup[];
  id: string;
  isUnread: boolean;
  isUrgent: boolean;
  itemCount: number;
  time: string;
  title: string;
}

const STATES: NotificationItemState[] = ["DUE_TODAY", "OVERDUE", "UPCOMING"];

// Spec 124 FR 18-19 and section 8: newest first, grouped by the user's local day of the notice.
export function toNoticeDays(
  notices: NotificationEntity[],
  languageTag: string,
  today: string,
  labels: { today: string; yesterday: string },
): NoticeDay[] {
  const days: NoticeDay[] = [];

  for (const notice of notices) {
    let day = days.find((entry) => entry.key === notice.localDate);

    if (!day) {
      day = {
        key: notice.localDate,
        label: dayLabel(notice.localDate, today, languageTag, labels),
        rows: [],
      };
      days.push(day);
    }
    day.rows.push(toRow(notice, languageTag));
  }

  return days;
}

function dayLabel(
  key: string,
  today: string,
  languageTag: string,
  labels: { today: string; yesterday: string },
) {
  if (key === today) {
    return labels.today;
  }

  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (key === yesterday.toISOString().slice(0, 10)) {
    return labels.yesterday;
  }

  return new Intl.DateTimeFormat(languageTag, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

function detailOf(item: NotificationItemEntity, languageTag: string): string {
  const { snapshot } = item;
  const parts = [
    snapshot.location,
    snapshot.accountName ?? snapshot.cardName,
    snapshot.ownerName,
  ].filter(Boolean) as string[];

  if (snapshot.valueCents !== undefined) {
    // Amounts live in the center only (the push never carries them).
    parts.unshift(
      formatMoney(snapshot.valueCents, snapshot.currency ?? "BRL", languageTag),
    );
  }

  return parts.join(" · ");
}

function dueLabelOf(
  item: NotificationItemEntity,
  today: string,
  languageTag: string,
) {
  if (item.state === "DUE_TODAY") {
    return "";
  }

  const [year, month, day] = item.dueDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const days = Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(ty, tm - 1, td)) / 86_400_000,
  );

  return new Intl.RelativeTimeFormat(languageTag, { numeric: "auto" }).format(
    days,
    "day",
  );
}

function formatMoney(cents: number, currency: string, languageTag: string) {
  return new Intl.NumberFormat(languageTag, {
    currency,
    style: "currency",
  }).format(cents / 100);
}

function toRow(notice: NotificationEntity, languageTag: string): NoticeRow {
  const today = notice.localDate;
  const groups = STATES.map((state) => ({
    items: notice.items
      .filter((item) => item.state === state)
      .map((item, index) => ({
        detail: detailOf(item, languageTag),
        dueLabel: dueLabelOf(item, today, languageTag),
        key: `${notice.id}-${state}-${index}`,
        label: item.snapshot.description,
        route: item.route,
        state,
        type: item.type,
      })),
    state,
  })).filter((group) => group.items.length > 0);

  return {
    groups,
    id: notice.id,
    isUnread: notice.readAt === null,
    isUrgent: notice.kind === "URGENT",
    itemCount: notice.items.length,
    time: new Intl.DateTimeFormat(languageTag, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(notice.createdAt)),
    title: notice.title,
  };
}
