import { View } from "react-native";

import getStyles from "./styles";

function ItemSeparator() {
  const styles = getStyles();

  return <View style={styles.container} />;
}

export default ItemSeparator;
