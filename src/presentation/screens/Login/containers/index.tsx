import { View } from "react-native";

import { GoogleButton, Welcome } from "@screens/Login/components";

import getStyles from "./styles";

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
