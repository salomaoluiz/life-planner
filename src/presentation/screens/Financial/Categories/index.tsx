import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import { Fab, Picker, Spacer, Text } from "@components";
import { useQuery } from "@infrastructure/fetcher";
import useTranslation from "@presentation/i18n/useTranslation";
import RefetchCache from "@screens/Financial/Transactions/containers/RefetchCache";

import ListItem from "./containers/ListItem";
import FinancialCategoryViewModel from "./models/FinancialCategoryViewModel";
import getStyles from "./styles";

function FinancialCategories() {
  const { styles } = getStyles();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<string>("ALL");

  const {
    data: flatViewModels,
    error,
    isFetching,
    refetch,
  } = useQuery<FinancialCategoryViewModel[]>({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    fetch: async () => {
      const owners = await useCases.getOwnersUseCase.execute();
      const ownerIds = owners.map((o) => o.id);

      const categoryDTOs =
        await useCases.getFinancialCategoriesUseCase.execute(ownerIds);

      return categoryDTOs.map(
        (dto) => new FinancialCategoryViewModel(dto, owners),
      );
    },
  });

  const displayedCategories = useMemo(() => {
    if (!flatViewModels) return [];
    const filtered =
      filterType === "ALL"
        ? flatViewModels
        : flatViewModels.filter((vm) => vm.type === filterType);
    return FinancialCategoryViewModel.buildHierarchy(filtered);
  }, [flatViewModels, filterType]);

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
          <View style={styles.filterContainer}>
            <Picker
              items={[
                { label: t("financial.categories.all"), value: "ALL" },
                { label: t("financial.categories.expense"), value: "EXPENSE" },
                { label: t("financial.categories.income"), value: "INCOME" },
              ]}
              label={t("financial.categories.filterByType")}
              onValueChange={setFilterType}
              selectedValue={filterType}
            />
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.listContainer}>
            <FlashList
              contentContainerStyle={styles.listContentContainer}
              data={displayedCategories}
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
