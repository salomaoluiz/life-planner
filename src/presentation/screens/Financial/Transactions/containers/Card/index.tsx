import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Text } from "@components";
import { IconButton } from "@components/Icon";
import { useMutation } from "@infrastructure/fetcher";
import FinancialTransactionViewModel from "@screens/Financial/Transactions/models/FinancialTransactionViewModel";

import getStyles from "./styles";

interface Props {
  item: FinancialTransactionViewModel;
  refetch: () => void;
}
function Card(props: Props) {
  const { styles, theme } = getStyles({
    isExpired: props.item.isExpense,
  });

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
      <View style={styles.subContainer}>
        <Text.Title value={props.item.description} />
        <Text.Label value={`Value: ${props.item.value}`} />
        <Text.Label value={`Date: ${props.item.transactionDate}`} />
        <Text.Label value={`Type: ${props.item.type}`} />
        <Text.Label value={`Owner: ${props.item.owner}`} />
      </View>
      <View style={styles.iconContainer}>
        <IconButton
          name={"delete"}
          onPress={onDelete}
          size={theme.sizes.spacing.large}
        />
      </View>
    </View>
  );
}
export default Card;
