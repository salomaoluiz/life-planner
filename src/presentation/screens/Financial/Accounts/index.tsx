import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import { Fab, Text } from "@components";
import { useQuery } from "@infrastructure/fetcher";
import useTranslation from "@presentation/i18n/useTranslation";
import RefetchCache from "@screens/Financial/Transactions/containers/RefetchCache";

import ListItem from "./containers/ListItem";
import FinancialAccountViewModel from "./models/FinancialAccountViewModel";
import getStyles from "./styles";

function FinancialAccounts() {
  const { styles } = getStyles();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { data, error, isFetching, refetch } = useQuery<
    FinancialAccountViewModel[]
  >({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    fetch: async () => {
      const owners = await useCases.getOwnersUseCase.execute();
      const ownerIds = owners.map((o) => o.id);

      const accountDTOs =
        await useCases.getFinancialAccountsUseCase.execute(ownerIds);

      return accountDTOs.map(
        (dto) => new FinancialAccountViewModel(dto, owners),
      );
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
        <Text.Title value={t("financial.accounts.loading")} />
      </View>
    );
  }

  function renderItem({ item }: { item: FinancialAccountViewModel }) {
    return <ListItem item={item} refetch={refetch} />;
  }

  function onAddAccountPress() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/financial/account/add_new_account" as any);
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
        <Fab icon={"plus"} onPress={onAddAccountPress} />
      </View>
    </>
  );
}

export default FinancialAccounts;
