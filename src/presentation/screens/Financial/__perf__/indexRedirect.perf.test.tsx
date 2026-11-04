import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

setupPerf();

// A screen with no data hook of its own: mounting it must not send anything.
function useStaticScreen() {
  return undefined;
}

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStaticScreen);

  expectWithinBudget(
    report("indexRedirect"),
    "financial.indexRedirect.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useStaticScreen);

  expectWithinBudget(
    { commits: commits() },
    "financial.indexRedirect.render.mount",
  );
  view.unmount();
});
