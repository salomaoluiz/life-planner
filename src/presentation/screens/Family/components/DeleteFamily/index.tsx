import { View } from "react-native";

import { Button } from "@components";

import getStyles from "./styles";

interface Props {
  onPress: () => void;
}

function AddNewFamilyMember(props: Props) {
  const { styles, theme } = getStyles();

  return (
    <View style={styles.container}>
      <Button.Text
        customStyles={{
          textColor: theme.colors.error,
        }}
        label={"Delete Family"}
        onPress={props.onPress}
      />
    </View>
  );
}

export default AddNewFamilyMember;
