import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNotificationsViewModel from "../hooks/useNotificationsViewModel";
import useNotificationSettingsViewModel from "../Settings/hooks/useNotificationSettingsViewModel";

setupPerf();

// Spec 124: the notice center (list, unread count, preferences, devices).
it("SHOULD open the center within the request budget", async () => {
  const view = await openScreen(useNotificationsViewModel);

  expectWithinBudget(report("notifications"), "notification.center.mount.cold");
  view.unmount();
});

it("SHOULD mount the center within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNotificationsViewModel);

  expectWithinBudget(
    { commits: commits() },
    "notification.center.render.mount",
  );
  view.unmount();
});

it("SHOULD open the settings within the request budget", async () => {
  const view = await openScreen(useNotificationSettingsViewModel);

  expectWithinBudget(
    report("notification-settings"),
    "notification.settings.mount.cold",
  );
  view.unmount();
});
