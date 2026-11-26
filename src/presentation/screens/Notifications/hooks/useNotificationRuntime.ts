import { router } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import { notificationsClient } from "@infrastructure/notifications";

import { resolveNoticeTarget } from "../models/noticeRoute";
import invalidateNotifications from "./invalidateNotifications";

const SEEN_INTERVAL_MS = 3_600_000;
let lastSeenAt = 0;

export function resetSeenThrottle() {
  lastSeenAt = 0;
}

async function markSeen(): Promise<void> {
  const now = Date.now();

  if (now - lastSeenAt < SEEN_INTERVAL_MS) {
    return;
  }

  try {
    const id = await notificationsClient.getDeviceId();

    if (id) {
      lastSeenAt = now;
      await useCases.markNotificationDeviceSeenUseCase.execute({
        id,
        locale: notificationsClient.getLocale(),
        timeZone: notificationsClient.getTimeZone(),
      });
    }
  } catch {
    // The next foreground tries again.
  }
}

export { SEEN_INTERVAL_MS };
// Spec 124 FR 23 and section 8: on start and when the app comes to the foreground (at most once an hour) the device
// reports its time zone and locale; a tapped push opens its target and marks the notice read; a push received in
// the foreground only refreshes the bell.
function useNotificationRuntime() {
  useEffect(() => {
    void markSeen();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void markSeen();
        void invalidateNotifications();
      }
    });
    const offTap = notificationsClient.onTap((data) => {
      if (data.notificationId) {
        void useCases.markNotificationReadUseCase
          .execute({ id: data.notificationId })
          .then(invalidateNotifications)
          .catch(() => undefined);
      }

      const target = resolveNoticeTarget(data.route ?? "");

      router.push({
        params: target.params,
        pathname: target.pathname,
      } as never);
    });
    const offReceive = notificationsClient.onReceive(() => {
      void invalidateNotifications();
    });

    return () => {
      subscription.remove();
      offTap();
      offReceive();
    };
  }, []);
}
export default useNotificationRuntime;
