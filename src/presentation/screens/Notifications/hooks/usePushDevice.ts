import { useCallback, useEffect, useState } from "react";

import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { useCases } from "@application/useCases";
import { NotificationDeviceEntity } from "@domain/entities/notification/NotificationEntity";
import { useQuery } from "@infrastructure/fetcher";
import {
  notificationsClient,
  PushPermission,
} from "@infrastructure/notifications";
import { isWeb } from "@utils/platform";

import invalidateNotifications from "./invalidateNotifications";

export type PushDeviceVM = ReturnType<typeof usePushDevice>;

// Spec 124 FR 22, 32-34: this device's permission, whether it is registered and the "Ativar" flow. The permission is
// only requested by `enable`, which the card and the settings call on a tap.
function usePushDevice() {
  const [permission, setPermission] = useState<PushPermission>("undetermined");
  const [deviceId, setDeviceId] = useState<null | string>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const devices = useQuery<NotificationDeviceEntity[]>({
    cacheKey: notificationKeys.devices(),
    fetch: async () => useCases.getNotificationDevicesUseCase.execute(),
  });

  useEffect(() => {
    let active = true;

    void notificationsClient.getPermission().then((value) => {
      if (active) {
        setPermission(value);
      }
    });
    void notificationsClient.getDeviceId().then((value) => {
      if (active) {
        setDeviceId(value);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const enable = useCallback(async (): Promise<PushPermission> => {
    setIsEnabling(true);

    try {
      const result = await notificationsClient.requestPermission();

      setPermission(result);

      if (result !== "granted") {
        return result;
      }

      const vapidKey = isWeb()
        ? await useCases.getWebPushKeyUseCase.execute()
        : undefined;
      const registration = await notificationsClient.getRegistration(vapidKey);

      if (!registration) {
        return "unsupported";
      }

      const { id } = await useCases.registerNotificationDeviceUseCase.execute({
        ...registration,
        locale: notificationsClient.getLocale(),
        timeZone: notificationsClient.getTimeZone(),
      });

      await notificationsClient.setDeviceId(id);
      setDeviceId(id);
      await invalidateNotifications();

      return "granted";
    } finally {
      setIsEnabling(false);
    }
  }, []);

  const isRegistered =
    deviceId !== null &&
    (devices.data ?? []).some((device) => device.id === deviceId);

  return {
    deviceId,
    devices: devices.data ?? [],
    enable,
    isEnabling,
    isLoaded: devices.data !== undefined,
    isRegistered,
    needsHomeScreenInstall: notificationsClient.needsHomeScreenInstall(),
    openSystemSettings: async () => notificationsClient.openSystemSettings(),
    permission,
  };
}

export default usePushDevice;
