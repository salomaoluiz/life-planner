import { Button, Text, View } from "react-native";
import { router } from "expo-router";

function Login() {
  return (
    <View>
      <Text>Login Screen</Text>
      <Button
        title={"Go To Home"}
        onPress={() => {
          router.back();
        }}
      />
    </View>
  );
}

export default Login;
