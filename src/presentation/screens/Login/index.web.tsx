// TODO: Remove this console log
/* eslint-disable no-console */

import { View } from "react-native";
import { router } from "expo-router";
import { Button, Text } from "@components";
import { useCallback, useEffect } from "react";
import { supabase } from "@infrastructure/supabase";

function Login() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Convert hash fragment to URLSearchParams
    const params = new URLSearchParams(hash.replace("#", "?"));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        console.debug("Success Login");
      });
    }
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut().then(() => {
      console.debug("Logout");
    });
  }, []);
  const login = useCallback(() => {
    supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: { redirectTo: "http://localhost:8081/login" },
      })
      .then((response) => {
        console.debug(response.data);
      });
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
