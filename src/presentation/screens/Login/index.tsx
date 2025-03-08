// TODO: Remove this console log
/* eslint-disable no-console */

import { View } from "react-native";
import { router } from "expo-router";
import { Button, Text } from "@components";
import { useCallback } from "react";
import { supabase } from "@infrastructure/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

function Login() {
  GoogleSignin.configure({
    offlineAccess: true,
    iosClientId:
      "1069049260763-tih01kb90dnrd319jpgb6ltas1hgbpn5.apps.googleusercontent.com",
    webClientId:
      "1069049260763-o02k1ig1dqvfm4e1vm6fo9rhq3ncmfkq.apps.googleusercontent.com",
  });
  const logout = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      supabase.auth.signOut().then(() => {
        console.debug("Logout");
      });
    } catch (e) {
      console.debug("error logout", {
        error: e,
      });
    }
  }, []);
  const login = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.data) {
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken!,
        });
      }
      console.log(response);
    } catch (e) {
      console.debug("error login", {
        error: e,
      });
    }
  }, []);

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
        <Button.Outlined
          label={"Login"}
          onPress={login}
          testID={"login-button"}
        />
        <Button.Filled
          testID={"go-to-home"}
          label={"Go To Home"}
          onPress={() => {
            router.navigate("/");
          }}
        />
        <Button.Outlined
          label={"Logout"}
          onPress={logout}
          testID={"logout-button"}
        />
      </View>
    </View>
  );
}

export default Login;
