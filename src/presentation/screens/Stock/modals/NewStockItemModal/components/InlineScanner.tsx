import { View } from "react-native";

import { Button, CameraViewport, Text } from "@components";
import {
  BarcodeScannerView,
  useScannerPermission,
  vibrateOnScan,
} from "@infrastructure/barcodeScanner";
import { useTranslation } from "@presentation/i18n";

import stockItemFormTestIds from "../testIds";

const HEIGHT = 200;

interface Props {
  onClose: () => void;
  onScanned: (code: string) => void;
}

// The camera under the code field of the form: one read fills the field and closes it (spec 121 FR 4).
function InlineScanner({ onClose, onScanned }: Props) {
  const { t } = useTranslation();
  const scanner = useScannerPermission();

  return (
    <View testID={stockItemFormTestIds.inlineScanner}>
      <CameraViewport height={HEIGHT} showGuide={scanner.status === "granted"}>
        {scanner.status === "granted" ? (
          <BarcodeScannerView
            onScan={(scanned) => {
              vibrateOnScan();
              onScanned(scanned.code);
            }}
          />
        ) : (
          <Text.Body
            value={t(
              scanner.status === "denied"
                ? "stock.barcode.permissionDenied"
                : "stock.barcode.cameraUnavailable",
            )}
          />
        )}
      </CameraViewport>
      <Button.Secondary
        label={t("common.actions.close")}
        onPress={onClose}
        testID={stockItemFormTestIds.inlineScannerClose}
      />
    </View>
  );
}

export default InlineScanner;
