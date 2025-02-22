import { Button, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@components";

function Login() {
  return (
    <View style={{ height: 500 }}>
      <View style={{ padding: 20, flex: 1, justifyContent: "space-between" }}>
        <Text.Display testID={"display"} value={"Display"} />
        <Text.Headline testID={"headline"} value={"Headline"} />
        <Text.Title testID={"title"} value={"Title"} />
        <Text.Body testID={"body"} value={"Body"} />
        <Text.Label testID={"label"} value={"Label"} />
        <Text.Caption testID={"caption"} value={"Caption"} />
      </View>
      <View>
        <Button
          title={"Go To Home"}
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </View>
  );
}

export default Login;
