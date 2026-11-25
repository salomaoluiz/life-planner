import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useStockBarcodeViewModel from "../modals/StockBarcodeModal/hooks/useStockBarcodeViewModel";

setupPerf();

jest.mock("@infrastructure/barcodeScanner", () => ({
  BarcodeScannerView: "BarcodeScannerView",
  useScannerPermission: () => ({ request: jest.fn(), status: "granted" }),
  vibrateOnScan: jest.fn(),
}));

it("SHOULD open within the request budget (the reader asks nothing until a code is read)", async () => {
  const view = await openScreen(useStockBarcodeViewModel);

  expectWithinBudget(report("barcode"), "stock.barcode.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useStockBarcodeViewModel);

  expectWithinBudget({ commits: commits() }, "stock.barcode.render.mount");
  view.unmount();
});
