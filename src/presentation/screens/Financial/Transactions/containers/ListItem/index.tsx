import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Text } from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useMutation } from "@infrastructure/fetcher";
import FinancialTransactionViewModel from "@screens/Financial/Transactions/models/FinancialTransactionViewModel";

import getStyles from "./styles";

interface Props {
  item: FinancialTransactionViewModel;
  refetch: () => void;
}
function ListItem(props: Props) {
  const { styles, theme } = getStyles();

  const deleteItem = useMutation({
    cacheKey: [useCases.deleteFinancialTransactionUseCase.uniqueName],
    fetch: useCases.deleteFinancialTransactionUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  async function onDelete() {
    deleteItem.mutate({
      id: props.item.ids.transactionId,
      ownerId: props.item.ids.ownerId,
    });
  }

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
      <View style={[styles.row, styles.width10]}>
        <Text.Body value={props.item.transactionDate} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Title numberOfLines={1} value={props.item.description} />
      </View>
      <View style={[styles.row, styles.width25]}>
        <Text.Body numberOfLines={1} value={props.item.category} />
      </View>
      <View style={[styles.row, styles.width10]}>
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
