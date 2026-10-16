import { AmountText, IconTile, ListItem } from "@components";
import { useTranslation } from "@presentation/i18n";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  item: TransactionUIModel;
  onPress: (id: string) => void;
}

function TransactionRow(props: Props) {
  const { t } = useTranslation();
  const { item } = props;

  return (
    <ListItem
      inset
      leading={<IconTile color={item.categoryColor} name={item.categoryIcon} />}
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
      trailing={<AmountText type={item.amountType} value={item.amountCents} />}
    />
  );
}

export default TransactionRow;
