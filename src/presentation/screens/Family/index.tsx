import { FlashList } from "@shopify/flash-list";
import { Text, View } from "react-native";

import { useFamilies } from "@screens/Family/hooks";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import * as Components from "./components";
import * as Containers from "./containers";
import getStyles from "./styles";

function Family() {
  const { families, isFetching, refetch } = useFamilies();
  const styles = getStyles();

  if (isFetching) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  function renderItems({ item }: { item: FamilyViewModel }) {
    return <Containers.FamilyCard family={item} refetchFamilies={refetch} />;
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={families}
        ItemSeparatorComponent={Components.ItemSeparator}
        renderItem={renderItems}
        showsVerticalScrollIndicator={false}
      />
      <Containers.NewFamilyButton />
    </View>
  );
}

export default Family;
