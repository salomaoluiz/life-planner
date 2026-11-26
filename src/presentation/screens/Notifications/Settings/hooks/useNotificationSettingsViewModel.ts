import { useEffect, useMemo } from "react";

import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { useCases } from "@application/useCases";
import { ApiBusinessError } from "@domain/entities/errors";
import {
  NotificationPreferencesEntity,
  NotificationPreferencesPatch,
  NotificationType,
} from "@domain/entities/notification/NotificationEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { notificationsClient } from "@infrastructure/notifications";
import invalidateNotifications from "@screens/Notifications/hooks/invalidateNotifications";
import usePushDevice from "@screens/Notifications/hooks/usePushDevice";

export type NotificationSettingsVM = ReturnType<
  typeof useNotificationSettingsViewModel
>;

function settingsErrorKey(saveError: unknown, other: unknown) {
  if (saveError instanceof ApiBusinessError && saveError.statusCode === 422) {
    return "notifications.settings.summaryInQuiet" as const;
  }

  return saveError || other
    ? ("notifications.settings.error" as const)
    : undefined;
}

function timeOptions(step: number): string[] {
  const options: string[] = [];

  for (let minute = 0; minute < 1440; minute += step) {
    options.push(
      `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
    );
  }

  return options;
}

// Spec 124 section 8: Configurações › Notificações. Every change saves on toggle (the screen follows the server's
// answer); a refused summary time shows the copy of FR 13.
function useNotificationSettingsViewModel() {
  const device = usePushDevice();
  const preferences = useQuery<NotificationPreferencesEntity>({
    cacheKey: notificationKeys.preferences(),
    fetch: async () => useCases.getNotificationPreferencesUseCase.execute(),
  });
  const save = useMutation<
    NotificationPreferencesPatch,
    NotificationPreferencesEntity
  >({
    cacheKey: [useCases.updateNotificationPreferencesUseCase.uniqueName],
    fetch: useCases.updateNotificationPreferencesUseCase.execute,
  });
  const updateDevice = useMutation<{ enabled?: boolean; id: string }, unknown>({
    cacheKey: [useCases.updateNotificationDeviceUseCase.uniqueName],
    fetch: useCases.updateNotificationDeviceUseCase.execute,
  });
  const removeDevice = useMutation<{ id: string }, void>({
    cacheKey: [useCases.deleteNotificationDeviceUseCase.uniqueName],
    fetch: useCases.deleteNotificationDeviceUseCase.execute,
  });
  const sendTest = useMutation<{ deviceId?: string }, void>({
    cacheKey: [useCases.sendTestNotificationUseCase.uniqueName],
    fetch: useCases.sendTestNotificationUseCase.execute,
  });

  useEffect(() => {
    if (
      save.status === "success" ||
      updateDevice.status === "success" ||
      removeDevice.status === "success"
    ) {
      void invalidateNotifications();
    }
  }, [save.status, updateDevice.status, removeDevice.status]);

  const data = preferences.data;
  const times = useMemo(
    () => timeOptions(data?.tickMinutes ?? 15),
    [data?.tickMinutes],
  );
  const errorKey = settingsErrorKey(
    save.error,
    updateDevice.error ?? removeDevice.error,
  );

  return {
    data,
    device,
    errorKey,
    isLoading: preferences.isFetching && !data,
    onDeviceRemove: (id: string) => removeDevice.mutate({ id }),
    onDeviceToggle: (id: string, enabled: boolean) =>
      updateDevice.mutate({ enabled, id }),
    onEnableHere: async () => {
      await device.enable();
    },
    onFamilyToggle: (familyId: string, enabled: boolean) =>
      save.mutate({ families: [{ enabled, familyId }] }),
    onLeadDaysChange: (type: NotificationType, days: number) =>
      save.mutate(
        type === "FINANCE_BILL_DUE"
          ? { billLeadDays: days }
          : { invoiceLeadDays: days },
      ),
    onQuietEndChange: (value: string) => save.mutate({ quietEnd: value }),
    onQuietStartChange: (value: string) => save.mutate({ quietStart: value }),
    onSummaryTimeChange: (value: string) => save.mutate({ summaryTime: value }),
    onTest: () => sendTest.mutate({ deviceId: device.deviceId ?? undefined }),
    onTypeToggle: (type: NotificationType, enabled: boolean) =>
      save.mutate({ types: { [type]: enabled } }),
    testSent: sendTest.status === "success",
    times,
    timeZone: data?.timeZone ?? notificationsClient.getTimeZone(),
  };
}

export default useNotificationSettingsViewModel;
