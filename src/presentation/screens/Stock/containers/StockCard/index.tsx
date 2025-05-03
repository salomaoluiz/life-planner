import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Text } from "@components";
import { IconButton } from "@components/Icon";
import { useMutation } from "@infrastructure/fetcher";
import StockViewModel from "@screens/Stock/models/StockViewModel";

import getStyles from "./styles";

interface Props {
  item: StockViewModel;
  refetch: () => void;
}
function StockCard(props: Props) {
  const { styles, theme } = getStyles({
    isExpired: props.item.isExpired,
  });

  const deleteItem = useMutation({
    cacheKey: [useCases.deleteStockItemUseCase.uniqueName],
    fetch: useCases.deleteStockItemUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  async function onDelete() {
    deleteItem.mutate({
      id: props.item.ids.itemId,
      ownerId: props.item.ids.ownerId,
    });
  }

  return (
    <View style={[styles.container, styles.row]}>
      <View style={styles.subContainer}>
        <Text.Title value={props.item.description} />
        <Text.Label value={`Quantity: ${props.item.quantity}`} />
        <Text.Label value={`Owner: ${props.item.owner}`} />
        <Text.Label
          color={props.item.isExpired ? theme.colors.error : undefined}
          value={`Status: ${props.item.status}`}
        />
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
export default StockCard;
