import { View } from "react-native";

import { Text } from "@components";
import Icon, { IconButton } from "@components/Icon";

import useListItem, { Props } from "./hooks";
import { getWebStyles } from "./styles";

function ListItem(props: Props) {
  const { styles, theme } = getWebStyles();

  const { onDelete } = useListItem(props);
  return (
    <View style={[styles.container, styles.row]}>
      <View style={[styles.row, styles.width5]}>
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
      <View style={[styles.row, styles.width25]}>
        <Text.Body value={props.item.transactionDate} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Title numberOfLines={1} value={props.item.description} />
      </View>
      <View style={[styles.row, styles.width20]}>
        <Text.Body numberOfLines={1} value={props.item.category} />
      </View>
      <View style={[styles.row, styles.width20]}>
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
      <View style={[styles.row, styles.iconsContainer]}>
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
