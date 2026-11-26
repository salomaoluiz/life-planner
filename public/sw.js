/* Spec 124: Web Push. Shows the notice and, on click, focuses or opens the app at the center. No amounts reach the
   payload (the backend keeps them out), nothing is cached here. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const data = payload.data || {};

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title || "Life Planner", {
        body: payload.body || "",
        data,
        icon: "/icons/icon-192.png",
        tag: data.notificationId,
      }),
      self.clients
        .matchAll({ includeUncontrolled: true, type: "window" })
        .then((clients) =>
          clients.forEach((client) =>
            client.postMessage({ type: "push-received" }),
          ),
        ),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};

  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        const target = `/notifications${data.notificationId ? `?notice=${data.notificationId}` : ""}`;
        const open = clients[0];

        if (open) {
          open.postMessage({ data, type: "notification-click" });

          return open.focus();
        }

        return self.clients.openWindow(target);
      }),
  );
});
