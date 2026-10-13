import { View } from "react-native";

import { Spacer, Text } from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useTranslation } from "@presentation/i18n";

import useListItem, { Props } from "./hooks";
import { getWebStyles } from "./styles";

function ListItem(props: Props) {
  const { t } = useTranslation();
  const { styles, theme } = getWebStyles();

  const { onDelete } = useListItem(props);
  return (
    <View style={[styles.container]}>
      <View style={[styles.row, styles.width25]}>
        <Icon
          color={
            props.item.isExpense ? theme.colors.expense : theme.colors.income
          }
          name={props.item.isExpense ? "arrow-down-bold" : "arrow-up-bold"}
          size={theme.sizes.spacing.xl}
        />
        <Spacer direction={"horizontal"} size={"md"} />
        <Text.Body value={props.item.transactionDate} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Title numberOfLines={1} value={props.item.description} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Body numberOfLines={1} value={props.item.category} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Body
          bold
          color={
            props.item.isExpense ? theme.colors.expense : theme.colors.income
          }
          numberOfLines={1}
          tabular
          value={props.item.value}
        />
      </View>
      <View style={[styles.row, styles.iconsContainer]}>
        <IconButton
          accessibilityLabel={t("common.actions.delete")}
          name={"delete"}
          onPress={onDelete}
          size={theme.sizes.spacing.xl}
        />
      </View>
    </View>
  );
}
export default ListItem;
