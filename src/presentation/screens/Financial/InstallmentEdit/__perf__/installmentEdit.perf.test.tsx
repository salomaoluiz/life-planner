import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useInstallmentEditViewModel from "../hooks/useInstallmentEditViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInstallmentEditViewModel, {
    id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  });

  expectWithinBudget(
    report("installmentEdit"),
    "financial.installmentEdit.mount.cold",
  );
  view.unmount();
});
