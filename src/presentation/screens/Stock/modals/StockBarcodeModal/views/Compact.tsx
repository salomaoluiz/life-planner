import { StyleSheet, View } from "react-native";

import { AdaptiveViewProps, Card, Screen, Text } from "@components";
import { IconButton } from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import StockQuickOverlays from "@screens/Stock/components/StockQuickOverlays";

import BarcodeResult from "../components/BarcodeResult";
import ScannerArea from "../components/ScannerArea";
import { StockBarcodeVM } from "../hooks";
import stockBarcodeTestIds from "../testIds";

const CAMERA_HEIGHT = 280;

// Phone: the camera on top and the code field and the result in a card below it (spec 121 FR 5).
function Compact({ vm }: AdaptiveViewProps<StockBarcodeVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    body: { gap: spacing.md },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

  return (
    <Screen scroll>
      <View style={styles.body}>
        <View style={styles.header}>
          <IconButton
            accessibilityLabel={t("stock.barcode.close")}
            name="close"
            onPress={vm.onClose}
            testID={stockBarcodeTestIds.close}
          />
          <Text.BodyStrong value={t("stock.barcode.title")} />
          <View style={{ width: spacing.xl }} />
        </View>
        <ScannerArea height={CAMERA_HEIGHT} vm={vm} />
        <Card>
          <BarcodeResult vm={vm} />
        </Card>
      </View>
      <StockQuickOverlays quick={vm.quick} />
    </Screen>
  );
}

export default Compact;
