import { Platform, StyleSheet, View } from "react-native";

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
import NoteIcon from "@screens/Financial/Transactions/components/NoteIcon";
import PendingChip from "@screens/Financial/Transactions/components/PendingChip";
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
    pending: { opacity: 0.5 },
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

  const flags =
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
    ) : undefined;

  const row = (
    <ListItem
      inset
      leading={<IconTile color={item.categoryColor} name={item.categoryIcon} />}
      meta={
        item.pendingState && Platform.OS !== "web" ? (
          <PendingChip state={item.pendingState} />
        ) : (
          flags
        )
      }
      onPress={() => {
        // Spec 061 FR 8: a row with a running request cannot be opened.
        if (item.isPending) {
          return;
        }
        if (item.isProjected && props.onProjectedPress) {
          props.onProjectedPress(item);
        } else {
          props.onPress(item.id);
        }
      }}
      strikethrough={item.pendingState === "deleting"}
      subtitle={subtitle}
      testID={rowTestID}
      // The stored description is English text; the app shows its own translated label.
      title={item.isAdjustment ? t("financial.transactions.adjustment") : title}
      trailing={
        <View style={styles.trailing}>
          {item.pendingState && Platform.OS === "web" ? (
            <PendingChip state={item.pendingState} />
          ) : null}
          {item.notes ? <NoteIcon note={item.notes} /> : null}
          <AmountText
            currency={item.currency}
            strikethrough={item.pendingState === "deleting"}
            type={item.amountType}
            value={item.amountCents}
          />
          {item.canPay && props.onPay && !item.isPending ? (
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

  if (item.isPending) {
    return <View style={styles.pending}>{row}</View>;
  }

  return item.isProjected ? <View style={styles.muted}>{row}</View> : row;
}

export default TransactionRow;
