import { View } from "react-native";

import { Button } from "@components";

import getStyles from "./styles";

interface Props {
  onPress: () => void;
}

function AddNewFamilyMember(props: Props) {
  const styles = getStyles();

  return (
    <View style={styles.container}>
      <Button.Filled label={"Add new Family Member"} onPress={props.onPress} />
    </View>
  );
}

export default AddNewFamilyMember;
