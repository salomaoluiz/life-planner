import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Fab, Text } from "@components";
import { useQuery } from "@infrastructure/fetcher";

import ItemSeparator from "./containers/ItemSeparator";
import ListItem from "./containers/ListItem";
import FinancialTransactionViewModel from "./models/FinancialTransactionViewModel";
import getStyles from "./styles";

function FinancialTransaction() {
  const styles = getStyles();
  const isFocused = useIsFocused();

  const { data, error, isFetching, refetch } = useQuery<
    FinancialTransactionViewModel[]
  >({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    fetch: async () => {
      const owner = await useCases.getOwnersUseCase.execute();
      const ownerIds = owner.map((owner) => owner.id);

      const transactionDTOs =
        await useCases.getFinancialTransactionsUseCase.execute({
          ownerIds,
        });

      return transactionDTOs.map(
        (stockDTO) => new FinancialTransactionViewModel(stockDTO, owner),
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

  function renderItem({
    item,
  }: {
    index: number;
    item: FinancialTransactionViewModel;
  }) {
    return <ListItem item={item} refetch={refetch} />;
  }

  function onAddTransactionItemPress() {
    router.push({
      pathname: "/financial/transaction/add_new_transaction",
    });
  }

  if (error) {
    return (
      <View>
        <Text.Headline value={`Error ${error.message}`} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlashList
          contentContainerStyle={styles.listContentContainer}
          data={data}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.fabContainer}>
        <Fab icon={"plus"} onPress={onAddTransactionItemPress} />
      </View>
    </View>
  );
}

export default FinancialTransaction;
