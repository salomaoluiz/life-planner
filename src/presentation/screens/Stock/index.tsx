import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Fab, Text } from "@components";
import { useQuery } from "@infrastructure/fetcher";
import StockCard from "@screens/Stock/containers/StockCard";
import StockViewModel from "@screens/Stock/models/StockViewModel";
import { isWeb } from "@utils/platform";

import getStyles from "./styles";

function Stock() {
  const styles = getStyles();
  const isFocused = useIsFocused();

  const { data, isFetching, refetch } = useQuery<StockViewModel[]>({
    cacheKey: [useCases.getStockItemsUseCase.uniqueName],
    fetch: async () => {
      const stockOwners = await useCases.getOwnersUseCase.execute();
      const stockOwnersIds = stockOwners.map((owner) => owner.id);

      const stockDTOS = await useCases.getStockItemsUseCase.execute({
        ownerIds: stockOwnersIds,
      });

      return stockDTOS.map(
        (stockDTO) => new StockViewModel(stockDTO, stockOwners),
      );
    },
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  if (isFetching) {
    return (
      <View>
        <Text.Title value={"Loading..."} />
      </View>
    );
  }

  function renderItem({ item }: { index: number; item: StockViewModel }) {
    return <StockCard item={item} refetch={refetch} />;
  }

  function onAddStockItemPress() {
    router.push({
      pathname: "/stock/add_new_stock_item",
    });
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        numColumns={isWeb() ? 2 : 1}
        renderItem={renderItem}
        style={{ flex: 1 }}
      />
      <View style={styles.fabContainer}>
        <Fab icon={"plus"} onPress={onAddStockItemPress} />
      </View>
    </View>
  );
}

export default Stock;
