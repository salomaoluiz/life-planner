import { AdaptiveViewProps, BottomSheet, FormColumns } from "@components";
import { useTranslation } from "@presentation/i18n";
import StockQuickOverlays from "@screens/Stock/components/StockQuickOverlays";

import BarcodeResult from "../components/BarcodeResult";
import ScannerArea from "../components/ScannerArea";
import { StockBarcodeVM } from "../hooks";

const CAMERA_HEIGHT = 340;

// Web and tablet: the camera on the left, the code field and the result on the right (spec 121 FR 6).
function Wide({ vm }: AdaptiveViewProps<StockBarcodeVM>) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      closeLabel={t("stock.barcode.close")}
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID="stock.barcode.sheet-frame"
      title={t("stock.barcode.title")}
      visible
    >
      <FormColumns
        left={<ScannerArea height={CAMERA_HEIGHT} vm={vm} />}
        right={<BarcodeResult vm={vm} />}
      />
      <StockQuickOverlays quick={vm.quick} />
    </BottomSheet>
  );
}

export default Wide;
