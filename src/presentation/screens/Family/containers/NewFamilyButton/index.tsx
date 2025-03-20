import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@components";

import getStyles from "./styles";

function NewFamilyButton() {
  const styles = getStyles();
  function handleAddNewFamily() {
    router.push("/family/add_new_family");
  }

  return (
    <View style={styles.container}>
      <Button.Outlined label={"Add New Family"} onPress={handleAddNewFamily} />
    </View>
  );
}

export default NewFamilyButton;
