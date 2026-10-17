import { StyleSheet, View } from "react-native";

import { AmountText, Badge, IconButton, IconTile, ListItem } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  isPaying?: boolean;
  item: TransactionUIModel;
  onPay?: (item: TransactionUIModel) => void;
  onPress: (id: string) => void;
}

function TransactionRow(props: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const { item } = props;
  const styles = StyleSheet.create({
    trailing: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  });

  return (
    <ListItem
      inset
      leading={<IconTile color={item.categoryColor} name={item.categoryIcon} />}
      meta={
        item.isOverdue ? (
          <Badge
            label={t("financial.transactions.overdue")}
            testID={transactionsTestIds.rowOverdue}
            tone={"expense"}
          />
        ) : undefined
      }
      onPress={() => props.onPress(item.id)}
      subtitle={item.subtitle}
      testID={
        item.isAdjustment
          ? transactionsTestIds.adjustmentRow
          : transactionsTestIds.row
      }
      // The stored description is English text; the app shows its own translated label.
      title={
        item.isAdjustment
          ? t("financial.transactions.adjustment")
          : item.description
      }
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
}

export default TransactionRow;
