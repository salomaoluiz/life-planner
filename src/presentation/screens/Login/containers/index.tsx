import { View } from "react-native";
import getStyles from "./styles";
import { GoogleButton, Welcome } from "@screens/Login/components";

export interface Props {
  onGoogleButtonPress: () => void;
}

function LoginContainer({ onGoogleButtonPress }: Props) {
  const styles = getStyles();
  return (
    <View style={styles.container}>
      <Welcome />
      <GoogleButton onPress={onGoogleButtonPress} />
    </View>
  );
}

export default LoginContainer;
