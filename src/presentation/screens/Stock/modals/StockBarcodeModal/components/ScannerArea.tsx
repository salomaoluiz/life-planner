import { Platform, StyleSheet, View } from "react-native";

import { CameraViewport, Text } from "@components";
import { IconButton } from "@components/Icon";
import Spinner from "@components/Spinner";
import { useKitTheme } from "@components/utils/useKitTheme";
import { BarcodeScannerView } from "@infrastructure/barcodeScanner";
import { useTranslation } from "@presentation/i18n";

import { StockBarcodeVM } from "../hooks";
import stockBarcodeTestIds from "../testIds";

interface Props {
  height?: number;
  vm: StockBarcodeVM;
}

// The live camera (or why there is none) with a framing guide and the torch toggle (spec 121 FR 5-6).
function ScannerArea({ height, vm }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    torch: { position: "absolute", right: spacing.sm, top: spacing.sm },
  });

  function renderBody() {
    if (vm.cameraStatus === "granted") {
      return (
        <>
          <BarcodeScannerView
            onError={vm.onCameraError}
            onScan={vm.onScan}
            paused={vm.paused}
            testID={stockBarcodeTestIds.camera}
            torch={vm.torch}
          />
          {Platform.OS === "web" ? null : (
            <View style={styles.torch}>
              <IconButton
                accessibilityLabel={t("stock.barcode.torch")}
                name={vm.torch ? "flashlight" : "flashlight-off"}
                onPress={vm.onToggleTorch}
                testID={stockBarcodeTestIds.torch}
              />
            </View>
          )}
        </>
      );
    }

    if (vm.cameraStatus === "loading") {
      return <Spinner accessibilityLabel={t("stock.barcode.looking")} />;
    }

    return (
      <Text.Body
        align="center"
        testID={
          vm.cameraStatus === "denied"
            ? stockBarcodeTestIds.permissionDenied
            : stockBarcodeTestIds.cameraUnavailable
        }
        value={t(
          vm.cameraStatus === "denied"
            ? "stock.barcode.permissionDenied"
            : "stock.barcode.cameraUnavailable",
        )}
      />
    );
  }

  return (
    <CameraViewport height={height} showGuide={vm.cameraStatus === "granted"}>
      {renderBody()}
    </CameraViewport>
  );
}

export default ScannerArea;
