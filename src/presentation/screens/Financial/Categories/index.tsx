import { View } from "react-native";

import { Text } from "@components";
import CategoriesList from "@screens/Financial/Categories/containers/CategoriesList";

import getStyles from "./styles";

function FinancialCategories() {
  const { styles } = getStyles();

  return (
    <View style={styles.container}>
      <Text.Headline bold value={"Categories"} />
      <CategoriesList />
    </View>
  );
}

export default FinancialCategories;
