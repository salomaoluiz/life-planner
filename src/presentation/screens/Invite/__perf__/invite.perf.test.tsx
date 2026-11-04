import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInviteViewModel from "../hooks/useInviteViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInviteViewModel, { token: "invite-token" });

  expectWithinBudget(report("invite"), "auth.invite.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useInviteViewModel, {
    token: "invite-token",
  });

  expectWithinBudget({ commits: commits() }, "auth.invite.render.mount");
  view.unmount();
});
