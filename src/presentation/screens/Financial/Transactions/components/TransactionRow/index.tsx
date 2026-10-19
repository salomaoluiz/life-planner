import { StyleSheet, View } from "react-native";

import {
  AmountText,
  Badge,
  Icon,
  IconButton,
  IconTile,
  ListItem,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  isPaying?: boolean;
  item: TransactionUIModel;
  onPay?: (item: TransactionUIModel) => void;
  onPress: (id: string) => void;
  onProjectedPress?: (item: TransactionUIModel) => void;
}

function TransactionRow(props: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const { item } = props;
  const styles = StyleSheet.create({
    muted: { opacity: 0.6 },
    trailing: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  });

  const title = item.counter
    ? `${item.description} ${item.counter}`
    : item.description;
  const subtitle = item.frequency
    ? [item.subtitle, t(`financial.recurrence.frequency.${item.frequency}`)]
        .filter(Boolean)
        .join(" · ")
    : item.subtitle;
  let rowTestID: string = transactionsTestIds.row;

  if (item.isAdjustment) {
    rowTestID = transactionsTestIds.adjustmentRow;
  } else if (item.isProjected) {
    rowTestID = transactionsTestIds.rowProjected;
  } else if (item.isRecurring) {
    rowTestID = transactionsTestIds.rowRecurring;
  }

  const row = (
    <ListItem
      inset
      leading={<IconTile color={item.categoryColor} name={item.categoryIcon} />}
      meta={
        item.isOverdue || item.isProjected || item.isRecurring ? (
          <View style={styles.trailing}>
            {item.isRecurring ? (
              <Icon
                name={"repeat"}
                size={16}
                testID={transactionsTestIds.rowRepeat}
              />
            ) : null}
            {item.isOverdue ? (
              <Badge
                label={t("financial.transactions.overdue")}
                testID={transactionsTestIds.rowOverdue}
                tone={"expense"}
              />
            ) : null}
            {item.isProjected ? (
              <Badge
                label={t("financial.recurrence.projected")}
                testID={transactionsTestIds.rowProjectedBadge}
                tone={"accent"}
              />
            ) : null}
          </View>
        ) : undefined
      }
      onPress={() =>
        item.isProjected && props.onProjectedPress
          ? props.onProjectedPress(item)
          : props.onPress(item.id)
      }
      subtitle={subtitle}
      testID={rowTestID}
      // The stored description is English text; the app shows its own translated label.
      title={item.isAdjustment ? t("financial.transactions.adjustment") : title}
      trailing={
        <View style={styles.trailing}>
          <AmountText type={item.amountType} value={item.amountCents} />
          {item.canPay && props.onPay ? (
            <IconButton
              accessibilityLabel={t("financial.transactions.pay")}
              name={props.isPaying ? "timer-sand" : "check-circle-outline"}
              onPress={() => {
                if (!props.isPaying) {
                  props.onPay?.(item);
                }
              }}
              testID={transactionsTestIds.rowPay}
              variant={"plain"}
            />
          ) : null}
        </View>
      }
    />
  );

  return item.isProjected ? <View style={styles.muted}>{row}</View> : row;
}

export default TransactionRow;
