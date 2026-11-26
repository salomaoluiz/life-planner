import { useEffect, useState } from "react";

import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { useCases } from "@application/useCases";
import {
  NotificationPreferencesEntity,
  NotificationSummaryPreview,
} from "@domain/entities/notification/NotificationEntity";
import { useQuery } from "@infrastructure/fetcher";
import { asyncStorage } from "@infrastructure/storage";
import usePushDevice from "@screens/Notifications/hooks/usePushDevice";
import useUnreadCount from "@screens/Notifications/hooks/useUnreadCount";
import { isWeb } from "@utils/platform";

export const DISMISS_KEY = "notification_permission_dismissed_at";
export const DISMISS_DAYS = 30;
const DAY_MS = 86_400_000;

export type PermissionCardMode = "blocked" | "hidden" | "invite" | "ios-web";

export function isDismissed(value: null | string, now = Date.now()): boolean {
  const at = value ? Number(value) : NaN;

  return !Number.isNaN(at) && now - at < DISMISS_DAYS * DAY_MS;
}

// Spec 124 FR 32-34: shown when this device is not registered, the permission is not denied for good, the user has
// something to be told about (a notice or an item for the next summary) and the card was not dismissed in 30 days.
function useNotificationPermissionCardViewModel() {
  const device = usePushDevice();
  const unread = useUnreadCount();
  const [dismissed, setDismissed] = useState(true);
  const preview = useQuery<NotificationSummaryPreview>({
    cacheKey: notificationKeys.preview(),
    fetch: async () => useCases.getNotificationSummaryPreviewUseCase.execute(),
  });
  const preferences = useQuery<NotificationPreferencesEntity>({
    cacheKey: notificationKeys.preferences(),
    fetch: async () => useCases.getNotificationPreferencesUseCase.execute(),
  });

  useEffect(() => {
    setDismissed(isDismissed(asyncStorage.getString(DISMISS_KEY)));
  }, []);

  const hasSomething = (preview.data?.hasItems ?? false) || unread.count > 0;
  let mode: PermissionCardMode = "hidden";

  if (device.isLoaded && !device.isRegistered && hasSomething) {
    if (device.needsHomeScreenInstall) {
      mode = "ios-web";
    } else if (device.permission === "denied") {
      mode = "blocked";
    } else if (device.permission !== "unsupported" && !dismissed) {
      mode = "invite";
    }
  }

  return {
    canOpenSettings: !isWeb(),
    count: preview.data?.count ?? 0,
    isEnabling: device.isEnabling,
    mode,
    onEnable: async () => {
      await device.enable();
    },
    onLater: () => {
      asyncStorage.setString(DISMISS_KEY, String(Date.now()));
      setDismissed(true);
    },
    onOpenSettings: async () => device.openSystemSettings(),
    summaryTime: preferences.data?.summaryTime ?? "08:00",
  };
}

export default useNotificationPermissionCardViewModel;
