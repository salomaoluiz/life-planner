import { useMemo, useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, Checkbox, EmptyState } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { locationLink } from "@domain/entities/stock/locationLink";
import { locationQrGridPrintHtml } from "@domain/entities/stock/locationQrPrint";
import { printHtml } from "@infrastructure/print";
import { qrMatrix } from "@infrastructure/qrcode";
import { useTranslation } from "@presentation/i18n";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";
import { webBase } from "@screens/Stock/containers/LocationQrPanel";

interface Props {
  locations: Array<{ id: string; path: string }>;
  onClose: () => void;
}

// Spec 125 FR 19: pick the locations (all checked) and print one page with a grid of labels (QR + path).
function LocationQrPrintSheet({ locations, onClose }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const [unchecked, setUnchecked] = useState<string[]>([]);
  const chosen = useMemo(
    () => locations.filter((location) => !unchecked.includes(location.id)),
    [locations, unchecked],
  );

  function toggle(id: string) {
    setUnchecked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function print() {
    const base = webBase();

    void printHtml(
      locationQrGridPrintHtml(
        chosen.map((location) => ({
          matrix: qrMatrix(locationLink(base, location.id)),
          name: location.path,
        })),
      ),
    );
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={chosen.length === 0}
          fullWidth
          label={t("stock.catalog.qrPrint.print")}
          onPress={print}
          testID={stockCatalogTestIds.printConfirm}
        />
      }
      onClose={onClose}
      testID={stockCatalogTestIds.printSheet}
      title={t("stock.catalog.qrPrint.title")}
      visible
    >
      {locations.length === 0 ? (
        <EmptyState
          message={t("stock.catalog.qrPrint.empty")}
          title={t("stock.catalog.qrPrint.title")}
        />
      ) : (
        <View style={{ gap: spacing.xxs }}>
          {locations.map((location) => (
            <Checkbox
              checked={!unchecked.includes(location.id)}
              key={location.id}
              label={location.path}
              onChange={() => toggle(location.id)}
              testID={`${stockCatalogTestIds.printRow}.${location.id}`}
            />
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

export default LocationQrPrintSheet;
