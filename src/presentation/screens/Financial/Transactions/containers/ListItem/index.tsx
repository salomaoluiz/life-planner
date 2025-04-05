import { View } from "react-native";

import { Text } from "@components";
import Icon, { IconButton } from "@components/Icon";

import useListItem, { Props } from "./hooks";
import { getStyles } from "./styles";

function ListItem(props: Props) {
  const { styles, theme } = getStyles();

  const { onDelete } = useListItem(props);

  return (
    <View style={styles.container}>
      <View style={styles.iconColumn}>
        <Icon
          color={
            props.item.isExpense
              ? theme.colors.financial.expense
              : theme.colors.financial.income
          }
          name={props.item.isExpense ? "arrow-down-bold" : "arrow-up-bold"}
          size={theme.sizes.spacing.large}
        />
      </View>
      <View style={styles.detailsColumn}>
        <Text.Body value={props.item.transactionDate} />
        <Text.Title numberOfLines={1} value={props.item.description} />
        <Text.Body numberOfLines={1} value={props.item.category} />
      </View>
      <View style={styles.priceColumn}>
        <Text.Body
          customStyles={{
            bold: true,
            color: props.item.isExpense
              ? theme.colors.financial.expense
              : theme.colors.financial.income,
          }}
          numberOfLines={1}
          value={props.item.value}
        />
      </View>
      <View style={styles.deleteColumn}>
        <IconButton
          name={"delete"}
          onPress={onDelete}
          size={theme.sizes.spacing.large}
        />
      </View>
    </View>
  );
}
export default ListItem;
