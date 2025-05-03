import { View } from "react-native";

import { Text } from "@components";

import getStyles from "./styles";

function ListHeader() {
  const styles = getStyles();
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.date]}>
        <Text.Title bold value={"Date"} />
      </View>
      <View style={[styles.row, styles.description]}>
        <Text.Title bold value={"Description"} />
      </View>
      <View style={[styles.row, styles.category]}>
        <Text.Title bold value={"Category"} />
      </View>
      <View style={[styles.row, styles.value]}>
        <Text.Title bold value={"Value"} />
      </View>
    </View>
  );
}

export default ListHeader;
