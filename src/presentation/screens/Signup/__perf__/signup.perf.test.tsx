import "@tests/perf/mocks";

// The login screens render while nobody is logged in: the profile query is not part of their budget.
jest.mock("@application/providers/user", () => ({
  useUser: () => ({ logged: false, update: jest.fn() }),
}));

import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useSignupViewModel from "../hooks/useSignupViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useSignupViewModel);

  expectWithinBudget(report("signup"), "auth.signup.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useSignupViewModel);

  expectWithinBudget({ commits: commits() }, "auth.signup.render.mount");
  view.unmount();
});
