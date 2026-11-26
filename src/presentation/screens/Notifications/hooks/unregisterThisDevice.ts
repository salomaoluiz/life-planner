import { useCases } from "@application/useCases";
import { notificationsClient } from "@infrastructure/notifications";

// Spec 124 FR 22: logout removes this device first, so the next user of the phone gets nothing meant for the last one.
// Best effort: a failure leaves the device for the 60-day cleanup and never blocks the logout.
async function unregisterThisDevice(): Promise<void> {
  try {
    const id = await notificationsClient.getDeviceId();

    if (id) {
      await useCases.deleteNotificationDeviceUseCase.execute({ id });
      await notificationsClient.clearDeviceId();
    }
  } catch {
    // see above
  }
}

export default unregisterThisDevice;
