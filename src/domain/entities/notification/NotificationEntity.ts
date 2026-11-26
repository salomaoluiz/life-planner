type DevicePlatform = "ANDROID" | "IOS" | "WEB";
type NotificationItemState = "DUE_TODAY" | "OVERDUE" | "UPCOMING";
type NotificationKind = "SUMMARY" | "URGENT";
type NotificationLocale = "en-US" | "pt-BR";
type NotificationModule = "FINANCE" | "STOCK";
// Spec 124: the notice center, the preferences and the devices. Same enum values as the API.
type NotificationType =
  | "FINANCE_BILL_DUE"
  | "FINANCE_INVOICE_DUE"
  | "STOCK_EXPIRING"
  | "STOCK_OPENED_EXPIRING";
type PushProvider = "EXPO" | "WEB_PUSH";

const NOTIFICATION_TYPES: NotificationType[] = [
  "STOCK_EXPIRING",
  "STOCK_OPENED_EXPIRING",
  "FINANCE_BILL_DUE",
  "FINANCE_INVOICE_DUE",
];

interface NotificationDeviceEntity {
  enabled: boolean;
  id: string;
  lastSeenAt: string;
  name: string;
  platform: DevicePlatform;
  provider: PushProvider;
}

interface NotificationEntity {
  createdAt: string;
  id: string;
  items: NotificationItemEntity[];
  kind: NotificationKind;
  localDate: string;
  readAt: null | string;
  title: string;
}

interface NotificationFilters {
  cursor?: string;
  module?: NotificationModule;
  unread?: boolean;
}

interface NotificationItemEntity {
  dueDate: string;
  route: string;
  snapshot: NotificationSnapshot;
  state: NotificationItemState;
  type: NotificationType;
}

interface NotificationPageEntity {
  items: NotificationEntity[];
  nextCursor: null | string;
}

interface NotificationPreferencesEntity {
  billLeadDays: number;
  families: { enabled: boolean; familyId: string; name: string }[];
  invoiceLeadDays: number;
  locale: NotificationLocale;
  quietEnd: string;
  quietStart: string;
  summaryTime: string;
  tickMinutes: number;
  timeZone: string;
  types: Record<NotificationType, boolean>;
}

interface NotificationPreferencesPatch {
  billLeadDays?: number;
  families?: { enabled: boolean; familyId: string }[];
  invoiceLeadDays?: number;
  quietEnd?: string;
  quietStart?: string;
  summaryTime?: string;
  types?: Partial<Record<NotificationType, boolean>>;
}

interface NotificationSnapshot {
  accountName?: string;
  cardName?: string;
  currency?: string;
  description: string;
  location?: string;
  ownerName?: string;
  quantity?: number;
  unit?: string;
  valueCents?: number;
}

interface NotificationSummaryPreview {
  count: number;
  hasItems: boolean;
}

interface RegisterNotificationDeviceInput {
  locale: NotificationLocale;
  name: string;
  platform: DevicePlatform;
  provider: PushProvider;
  timeZone: string;
  token: string;
  webKeys?: { auth: string; p256dh: string };
}

export { NOTIFICATION_TYPES };
export type {
  DevicePlatform,
  NotificationDeviceEntity,
  NotificationEntity,
  NotificationFilters,
  NotificationItemEntity,
  NotificationItemState,
  NotificationKind,
  NotificationLocale,
  NotificationModule,
  NotificationPageEntity,
  NotificationPreferencesEntity,
  NotificationPreferencesPatch,
  NotificationSnapshot,
  NotificationSummaryPreview,
  NotificationType,
  PushProvider,
  RegisterNotificationDeviceInput,
};
