import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useInviteViewModel from "../hooks/useInviteViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInviteViewModel, { token: "invite-token" });

  expectWithinBudget(report("invite"), "auth.invite.mount.cold");
  view.unmount();
});
