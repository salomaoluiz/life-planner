import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

setupPerf();

// A screen with no data hook of its own: mounting it must not send anything.
function useStaticScreen() {
  return undefined;
}

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStaticScreen);

  expectWithinBudget(report("feedback"), "home.feedback.mount.cold");
  view.unmount();
});
