import { StyleSheet, View } from "react-native";

import { Badge, Icon, IconButton, Text } from "@components";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import {
  LONG_PRESS_MS,
  QuickDirection,
  StockQuickMovementVM,
} from "@screens/Stock/hooks/useStockQuickMovement";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";
import stockTestIds from "@screens/Stock/testIds";

interface Props {
  item: StockItemUIModel;
  quick: StockQuickMovementVM;
}

// Spec 117 FR 1-3, 11-13: − quantity + on the right of the row, "Abri" next to it, "pending" while queued.
function StockQuickStepper({ item, quick }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const dto = item.raw;
  const step = dto.quickStep ?? 1;
  const quantity = quick.displayQuantity(dto);
  const quantityText = `${item.quantityFor(quantity).text} ${t(
    item.quantityFor(quantity).unitKey,
  )}`;
  const pending = quick.isPending(dto.id);
  const styles = StyleSheet.create({
    quantity: { minWidth: 56, textAlign: "center" },
    root: { alignItems: "center", flexDirection: "row", gap: spacing.xxs },
  });

  if (item.isReadOnly) {
    return (
      <Text.BodyStrong testID={stockTestIds.rowQuantity} value={quantityText} />
    );
  }

  const stepText = item.quantityFor(step).text;
  const name = dto.description;

  function button(direction: QuickDirection) {
    const taking = direction === -1;

    return (
      <IconButton
        accessibilityLabel={t(
          taking ? "stock.quick.decrementA11y" : "stock.quick.incrementA11y",
          { name, step: stepText },
        )}
        delayLongPress={LONG_PRESS_MS}
        disabled={taking && quantity <= 0}
        name={taking ? "minus" : "plus"}
        onContextMenu={() => quick.onExactOpen(dto, direction)}
        onLongPress={() => quick.onExactOpen(dto, direction)}
        onPress={() => quick.onStep(dto, direction, step)}
        testID={taking ? stockTestIds.rowDecrement : stockTestIds.rowIncrement}
      />
    );
  }

  return (
    <View style={styles.root}>
      {item.canOpen && !quick.isOpened(dto.id) ? (
        <Touchable
          accessibilityLabel={t("stock.quick.openA11y", { name })}
          accessibilityRole="button"
          onPress={() => void quick.onOpen(dto)}
          testID={stockTestIds.rowOpen}
        >
          <Badge label={t("stock.quick.open")} tone="accent" />
        </Touchable>
      ) : null}
      {pending ? (
        <View
          accessibilityLabel={t("stock.offline.pending")}
          testID={stockTestIds.rowPending}
        >
          <Icon name="cloud-upload-outline" size={16} />
        </View>
      ) : null}
      {button(-1)}
      <Text.BodyStrong testID={stockTestIds.rowQuantity} value={quantityText} />
      {button(1)}
    </View>
  );
}

export default StockQuickStepper;
