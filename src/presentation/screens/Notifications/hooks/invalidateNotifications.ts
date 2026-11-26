import { notificationKeys } from "@application/queryKeys/notificationKeys";
import { invalidateFetcherData } from "@infrastructure/fetcher";

async function invalidateNotifications() {
  await invalidateFetcherData(notificationKeys.all());
}

export default invalidateNotifications;
