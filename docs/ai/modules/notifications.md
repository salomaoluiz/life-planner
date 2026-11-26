# Notifications (spec 124)

Backend: `../life-planner-back` (`/api/v1/notifications/*`, see its `api.md`). Everything is the caller's own; nothing is cached (the bell and the center read the server every time they are stale).

## Layers

- Domain: `src/domain/entities/notification/NotificationEntity.ts` (types, kinds, states, preferences, devices), `src/domain/repositories/notification/notificationRepository.ts` (`notificationRepository` in `Repositories`).
- Data: `src/data/models/notification/NotificationModels.ts` (tolerant `fromJSON`), `src/data/datasource/data/notification/api/notificationApi.ts` (all calls through `@infrastructure/api`; tokens and keys travel only in `registerDevice`), `src/data/repositories/repos/notification/*`.
- Application: 14 use cases in `src/application/useCases/cases/notification/` (`getNotificationsUseCase`, `getUnreadNotificationCountUseCase`, `markNotificationReadUseCase`, `markAllNotificationsReadUseCase`, `getNotificationSummaryPreviewUseCase`, preferences get/update, devices get/register/update/delete/markSeen, `sendTestNotificationUseCase`, `getWebPushKeyUseCase`); query keys in `src/application/queryKeys/notificationKeys.ts`.
- Infrastructure: `src/infrastructure/notifications` (`notificationsClient`): native `index.ts` (`expo-notifications`, Expo push token, device id in SecureStore, foreground pushes are silent), web `index.web.ts` (service worker `public/sw.js`, Push API subscription with the VAPID key the API serves, device id in local storage, iOS Safari outside the Home Screen reports `needsHomeScreenInstall`). The permission is only requested by `usePushDevice().enable` (the card and the settings), never at start.
- Presentation: `src/presentation/screens/Notifications` (center: `hooks/useNotificationsViewModel`, `views/Wide.tsx`, `models/NoticeUIModel`, `models/noticeRoute`; `Settings/` for Configurações › Notificações; containers `NotificationBell`, `NotificationPermissionCard`, `NotificationRuntime`).

## Behavior

- Routes: hidden tabs `notifications` (center, `?notice=<id>` from a web push marks it read) and `notification-settings`; Config has a "Notificações" button. The bell sits in the Home, Financial, Investments, Stock and Family headers with the count capped at "9+".
- `NotificationRuntime` (mounted in `app/(app)/_layout.tsx`): reports time zone and locale (`PATCH devices/:id/seen`, at most hourly), opens the target of a tapped push and marks the notice read, refreshes the bell on a foreground push or when the app comes back.
- `resolveNoticeTarget` maps the backend `route` of an item to the app: `/stock/items/:id?lot=&ownerId=` → modal `add_new_stock_item` over `/stock`, `/finance/transactions/:id` → `add_new_transaction`, `/credit-cards/:id/invoices/:YYYY-MM` → `invoice_detail`, projected occurrences → the transactions list.
- Permission card (`NotificationPermissionCard`, at the top of the Home content and of the center): invite when this device is not registered, the permission is not denied for good, there is something to tell (unread notices or `summary-preview.hasItems`) and it was not dismissed in 30 days ("Agora não" is kept per device in local storage); blocked state opens the device settings (native) or explains the browser way (web); iOS web outside the Home Screen shows the hint.
- Logout removes this device first (`unregisterThisDevice`, best effort). The current device is known by the id stored on the device (the API client sends no custom header on GET).
- Not built: a two-column master/detail center on wide screens (the selected notice expands in place), quick actions on a notice.
