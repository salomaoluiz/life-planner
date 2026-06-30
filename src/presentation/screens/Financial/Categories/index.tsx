import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import { Fab, Text } from "@components";
import { useQuery } from "@infrastructure/fetcher";
import RefetchCache from "@screens/Financial/Transactions/containers/RefetchCache";

import ListItem from "./containers/ListItem";
import FinancialCategoryViewModel from "./models/FinancialCategoryViewModel";
import getStyles from "./styles";

function FinancialCategories() {
  const { styles } = getStyles();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const { data, error, isFetching, refetch } = useQuery<
    FinancialCategoryViewModel[]
  >({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    fetch: async () => {
      const owners = await useCases.getOwnersUseCase.execute();
      const ownerIds = owners.map((o) => o.id);

      const categoryDTOs =
        await useCases.getFinancialCategoriesUseCase.execute(ownerIds);

      const viewModels = categoryDTOs.map(
        (dto) => new FinancialCategoryViewModel(dto, owners),
      );

      return FinancialCategoryViewModel.buildHierarchy(viewModels);
    },
  });

  useEffect(() => {
    if (!isFetching) {
      navigation.setOptions({
        headerRight: () => <RefetchCache refetchQuery={refetch} />,
      });
    }
  }, [navigation, isFetching, refetch]);

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  if (isFetching) {
    return (
      <View style={styles.container}>
        <Text.Title value={"Loading..."} />
      </View>
    );
  }

  function renderItem({ item }: { item: FinancialCategoryViewModel }) {
    return <ListItem item={item} refetch={refetch} />;
  }

  function onAddCategoryPress() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/financial/category/add_new_category" as any);
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text.Headline value={`Error ${error.message}`} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.listContainer}>
            <FlashList
              contentContainerStyle={styles.listContentContainer}
              data={data}
              estimatedItemSize={60}
              renderItem={renderItem}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.fabContainer}>
        <Fab icon={"plus"} onPress={onAddCategoryPress} />
      </View>
    </>
  );
}

export default FinancialCategories;
