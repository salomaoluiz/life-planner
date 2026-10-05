import { AmountText, IconTile, ListItem } from "@components";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";

interface Props {
  item: TransactionUIModel;
  onPress: (id: string) => void;
}

function TransactionRow(props: Props) {
  const { item } = props;

  return (
    <ListItem
      leading={<IconTile color={item.categoryColor} name={item.categoryIcon} />}
      onPress={() => props.onPress(item.id)}
      subtitle={item.subtitle}
      testID={`transaction-row-${item.id}`}
      title={item.description}
      trailing={<AmountText type={item.amountType} value={item.amountCents} />}
    />
  );
}

export default TransactionRow;
