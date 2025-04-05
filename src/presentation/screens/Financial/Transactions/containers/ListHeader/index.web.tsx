import { View } from "react-native";

import { Text } from "@components";

import getStyles from "./styles";

function ListHeader() {
  const styles = getStyles();
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.date]}>
        <Text.Title customStyles={{ bold: true }} value={"Date"} />
      </View>
      <View style={[styles.row, styles.description]}>
        <Text.Title customStyles={{ bold: true }} value={"Description"} />
      </View>
      <View style={[styles.row, styles.category]}>
        <Text.Title customStyles={{ bold: true }} value={"Category"} />
      </View>
      <View style={[styles.row, styles.value]}>
        <Text.Title customStyles={{ bold: true }} value={"Value"} />
      </View>
    </View>
  );
}

export default ListHeader;
