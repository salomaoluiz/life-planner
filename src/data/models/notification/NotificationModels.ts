import {
  DevicePlatform,
  NOTIFICATION_TYPES,
  NotificationDeviceEntity,
  NotificationEntity,
  NotificationItemEntity,
  NotificationItemState,
  NotificationKind,
  NotificationLocale,
  NotificationPageEntity,
  NotificationPreferencesEntity,
  NotificationSnapshot,
  NotificationType,
  PushProvider,
} from "@domain/entities/notification/NotificationEntity";

type Json = Record<string, unknown>;

const ITEM_STATES: NotificationItemState[] = [
  "DUE_TODAY",
  "OVERDUE",
  "UPCOMING",
];
const KINDS: NotificationKind[] = ["SUMMARY", "URGENT"];
const PLATFORMS: DevicePlatform[] = ["ANDROID", "IOS", "WEB"];
const PROVIDERS: PushProvider[] = ["EXPO", "WEB_PUSH"];

// API shapes of `/v1/notifications/*` (spec 124). Tolerant: a missing list is empty, an unknown enum falls back.
class NotificationModels {
  static deviceFromJSON(data: Json): NotificationDeviceEntity {
    return {
      enabled: data.enabled !== false,
      id: String(data.id ?? ""),
      lastSeenAt: String(data.lastSeenAt ?? ""),
      name: String(data.name ?? ""),
      platform: pick(PLATFORMS, data.platform, "WEB"),
      provider: pick(PROVIDERS, data.provider, "WEB_PUSH"),
    };
  }

  static pageFromJSON(data: Json): NotificationPageEntity {
    return {
      items: list(data.items).map((notice) => noticeFromJSON(notice)),
      nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
    };
  }

  static preferencesFromJSON(data: Json): NotificationPreferencesEntity {
    const types = (data.types ?? {}) as Json;

    return {
      billLeadDays: Number(data.billLeadDays ?? 3),
      families: list(data.families).map((family) => ({
        enabled: family.enabled !== false,
        familyId: String(family.familyId ?? ""),
        name: String(family.name ?? ""),
      })),
      invoiceLeadDays: Number(data.invoiceLeadDays ?? 3),
      locale:
        data.locale === "en-US" ? "en-US" : ("pt-BR" as NotificationLocale),
      quietEnd: String(data.quietEnd ?? "07:00"),
      quietStart: String(data.quietStart ?? "22:00"),
      summaryTime: String(data.summaryTime ?? "08:00"),
      tickMinutes: Number(data.tickMinutes ?? 15),
      timeZone: String(data.timeZone ?? "America/Sao_Paulo"),
      types: Object.fromEntries(
        NOTIFICATION_TYPES.map((type) => [type, types[type] !== false]),
      ) as Record<NotificationType, boolean>,
    };
  }
}

function itemFromJSON(data: Json): NotificationItemEntity {
  return {
    dueDate: String(data.dueDate ?? ""),
    route: String(data.route ?? ""),
    snapshot: {
      description: "",
      ...((data.snapshot ?? {}) as Partial<NotificationSnapshot>),
    },
    state: pick(ITEM_STATES, data.state, "UPCOMING"),
    type: pick(NOTIFICATION_TYPES, data.type, "STOCK_EXPIRING"),
  };
}

function list(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

function noticeFromJSON(data: Json): NotificationEntity {
  return {
    createdAt: String(data.createdAt ?? ""),
    id: String(data.id ?? ""),
    items: list(data.items).map((item) => itemFromJSON(item)),
    kind: pick(KINDS, data.kind, "SUMMARY"),
    localDate: String(data.localDate ?? ""),
    readAt: typeof data.readAt === "string" ? data.readAt : null,
    title: String(data.title ?? ""),
  };
}

function pick<T extends string>(allowed: T[], value: unknown, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default NotificationModels;
