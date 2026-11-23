import { AdaptiveLayout } from "@components";

import { useStockBarcodeViewModel } from "./hooks";
import { Compact, Wide } from "./views";

// Spec 121: the barcode reader modal (`stock_barcode`).
function StockBarcodeModal() {
  const vm = useStockBarcodeViewModel();

  return <AdaptiveLayout compact={Compact} vm={vm} wide={Wide} />;
}

export default StockBarcodeModal;
