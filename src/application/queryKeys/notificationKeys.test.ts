import { notificationKeys } from "./notificationKeys";

it("SHOULD keep every key under the notification root", () => {
  const all = notificationKeys.all();

  expect(notificationKeys.devices()).toEqual([...all, "devices"]);
  expect(notificationKeys.list("STOCK")).toEqual([...all, "list", "STOCK"]);
  expect(notificationKeys.preferences()).toEqual([...all, "preferences"]);
  expect(notificationKeys.preview()).toEqual([...all, "preview"]);
  expect(notificationKeys.unread()).toEqual([...all, "unread"]);
});
