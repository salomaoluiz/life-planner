import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { useCases } from "@application/useCases";
import {
  NotificationEntity,
  NotificationFilters,
  NotificationPageEntity,
  NotificationPreferencesEntity,
} from "@domain/entities/notification/NotificationEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";

import { resolveNoticeTarget } from "../models/noticeRoute";
import { NoticeRow, toNoticeDays } from "../models/NoticeUIModel";
import invalidateNotifications from "./invalidateNotifications";
import usePushDevice from "./usePushDevice";
import useUnreadCount from "./useUnreadCount";

export type NotificationFilter = "all" | "FINANCE" | "STOCK" | "unread";
export type NotificationsVM = ReturnType<typeof useNotificationsViewModel>;

export const NOTIFICATION_SETTINGS_PATH = "/notification-settings";

function filtersOf(filter: NotificationFilter): NotificationFilters {
  if (filter === "all") {
    return {};
  }

  return filter === "unread" ? { unread: true } : { module: filter };
}

function localToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

// Spec 124 FR 18-21 and section 8: the notice center, newest first, 20 per page, filters by module and unread.
function useNotificationsViewModel() {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const languageTag = getLocale().languageTag;
  const params = useLocalSearchParams<{ notice?: string }>();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [more, setMore] = useState<{
    cursor: null | string;
    items: NotificationEntity[];
  }>({ cursor: null, items: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(
    params.notice,
  );
  const unread = useUnreadCount();
  const device = usePushDevice();
  const list = useQuery<NotificationPageEntity>({
    cacheKey: notificationKeys.list(filter),
    fetch: async () =>
      useCases.getNotificationsUseCase.execute(filtersOf(filter)),
  });
  const preferences = useQuery<NotificationPreferencesEntity>({
    cacheKey: notificationKeys.preferences(),
    fetch: async () => useCases.getNotificationPreferencesUseCase.execute(),
  });
  const read = useMutation<{ id: string }, void>({
    cacheKey: [useCases.markNotificationReadUseCase.uniqueName],
    fetch: useCases.markNotificationReadUseCase.execute,
  });
  const readAll = useMutation<void, void>({
    cacheKey: [useCases.markAllNotificationsReadUseCase.uniqueName],
    fetch: async () => useCases.markAllNotificationsReadUseCase.execute(),
  });
  const loadMore = useMutation<string, NotificationPageEntity>({
    cacheKey: [useCases.getNotificationsUseCase.uniqueName, "more"],
    fetch: async (cursor) =>
      useCases.getNotificationsUseCase.execute({
        ...filtersOf(filter),
        cursor,
      }),
  });

  // A new first page (filter change, refetch, read) replaces what "Carregar mais" had appended.
  useEffect(() => {
    setMore({ cursor: null, items: [] });
  }, [filter, list.data]);

  useEffect(() => {
    if (read.status === "success" || readAll.status === "success") {
      void invalidateNotifications();
    }
  }, [read.status, readAll.status]);

  useEffect(() => {
    const page = loadMore.data;

    if (page) {
      setMore((current) => ({
        cursor: page.nextCursor,
        items: [...current.items, ...page.items],
      }));
    }
  }, [loadMore.data]);

  const notices = useMemo(
    () => [...(list.data?.items ?? []), ...more.items],
    [list.data, more.items],
  );
  const days = useMemo(
    () =>
      toNoticeDays(notices, languageTag, localToday(), {
        today: t("common.date.today"),
        yesterday: t("common.date.yesterday"),
      }),
    [notices, languageTag, t],
  );
  const nextCursor =
    more.items.length > 0 ? more.cursor : (list.data?.nextCursor ?? null);
  const allTypesOff =
    preferences.data !== undefined &&
    Object.values(preferences.data.types).every((enabled) => !enabled);

  function onNoticePress(row: NoticeRow) {
    setSelectedId(row.id);

    if (row.isUnread) {
      read.mutate({ id: row.id });
    }
  }

  // A notice opened from a web push (`?notice=`) is marked read once, as soon as it is in the list.
  const handledNotice = useRef<string>();

  useEffect(() => {
    const row = days
      .flatMap((day) => day.rows)
      .find((entry) => entry.id === params.notice);

    if (row?.isUnread && handledNotice.current !== row.id) {
      handledNotice.current = row.id;
      read.mutate({ id: row.id });
    }
  }, [params.notice, days, read]);

  return {
    allTypesOff,
    days,
    device,
    errorKey:
      list.error && !list.data ? ("notifications.error" as const) : undefined,
    filter,
    hasNext: nextCursor !== null,
    isEmpty: !list.isFetching && notices.length === 0 && !list.error,
    isLoading: list.isFetching && !list.data,
    isLoadingMore: loadMore.isFetching,
    onFilterChange: (value: string) => setFilter(value as NotificationFilter),
    onItemPress: (route: string) =>
      router.push({
        params: resolveNoticeTarget(route).params,
        pathname: resolveNoticeTarget(route).pathname,
      } as never),
    onLoadMore: () => nextCursor && loadMore.mutate(nextCursor),
    onMarkAllRead: () => readAll.mutate(),
    onNoticePress,
    onRetry: async () => list.refetch(),
    onSettingsPress: () => router.push(NOTIFICATION_SETTINGS_PATH as never),
    selectedId,
    unreadCount: unread.count,
  };
}

export default useNotificationsViewModel;
