import { memo } from "react";
import { Platform, View } from "react-native";

import {
  AmountText,
  Badge,
  Icon,
  IconButton,
  IconTile,
  ListItem,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import NoteIcon from "@screens/Financial/Transactions/components/NoteIcon";
import PendingChip from "@screens/Financial/Transactions/components/PendingChip";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

interface Props {
  isPaying?: boolean;
  item: TransactionUIModel;
  // A balance adjustment cannot be edited: its row opens the delete sheet instead of the form.
  onAdjustmentPress?: (item: TransactionUIModel) => void;
  onPay?: (item: TransactionUIModel) => void;
  onPress: (id: string) => void;
  onProjectedPress?: (item: TransactionUIModel) => void;
}

function sameRowProps(prev: Props, next: Props) {
  return (
    prev.isPaying === next.isPaying &&
    prev.onAdjustmentPress === next.onAdjustmentPress &&
    prev.onPay === next.onPay &&
    prev.onPress === next.onPress &&
    prev.onProjectedPress === next.onProjectedPress &&
    sameTransaction(prev.item, next.item)
  );
}

// The model is rebuilt on every refetch: rows compare what they show, so an unchanged row is not rendered again.
function sameTransaction(a: TransactionUIModel, b: TransactionUIModel) {
  if (a === b) {
    return true;
  }
  if (
    a.pendingState !== b.pendingState ||
    a.categoryColor !== b.categoryColor ||
    a.categoryIcon !== b.categoryIcon
  ) {
    return false;
  }
  const left = a.dto as unknown as Record<string, unknown>;
  const right = b.dto as unknown as Record<string, unknown>;
  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) =>
        Object.is(left[key], right[key]) ||
        (typeof left[key] === "object" &&
          JSON.stringify(left[key]) === JSON.stringify(right[key])),
    )
  );
}

function TransactionRow(props: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { item } = props;

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
        if (item.isAdjustment && props.onAdjustmentPress) {
          props.onAdjustmentPress(item);
        } else if (item.isProjected && props.onProjectedPress) {
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

export { sameTransaction };
export default memo(TransactionRow, sameRowProps);
