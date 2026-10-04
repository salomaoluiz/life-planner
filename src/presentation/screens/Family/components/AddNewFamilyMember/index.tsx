import { View } from "react-native";

import { Button } from "@components";

import getStyles from "./styles";

interface Props {
  label: string;
  onPress: () => void;
}

function AddNewFamilyMember(props: Props) {
  const styles = getStyles();

  return (
    <View style={styles.container}>
      <Button.Filled label={props.label} onPress={props.onPress} />
    </View>
  );
}

export default AddNewFamilyMember;
