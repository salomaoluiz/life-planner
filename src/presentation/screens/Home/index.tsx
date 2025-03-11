// TODO: Remove this console log
/* eslint-disable no-console */

import { View } from "react-native";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import { Button, Switch, Text } from "@components";
import { useTheme } from "@presentation/theme";
import { useEffect } from "react";
import { useCases } from "@application/useCases";
import { useUser } from "@application/providers/user";
import { useMutation } from "@infrastructure/fetcher";

function Home() {
  const { t } = useTranslation();
  const { availableLanguages, changeLocale, getLocale } =
    useTranslationLocale();
  const { update } = useUser();

  const { mutate, status } = useMutation<void, void>({
    cacheKey: [useCases.logoutUseCase.uniqueName],
    fetch: useCases.logoutUseCase.execute,
  });

  useEffect(() => {
    if (status === "success") {
      update();
    }
  }, [status]);

  const { setIsDark, isDark } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text.Body value={t("home.editLabel")} testID={"edit-label"} />
      {availableLanguages.map((location, index) => (
        <Button.Filled
          testID={`button-${index}`}
          key={`button-${index}`}
          label={location}
          onPress={() => {
            changeLocale(location);
          }}
        />
      ))}
      <Text.Display testID={"display"} value={`isDark: ${isDark}`} />
      <Switch testID={"switch"} initialStatus={isDark} onToggle={setIsDark} />
      <Button.Outlined
        testID={"go-to-login"}
        label={"Go To Login"}
        onPress={async () => {
          mutate();
        }}
      />
      <Text.Caption
        value={JSON.stringify(getLocale()).replaceAll(",", "\n,")}
        testID={"locale"}
      />
    </View>
  );
}

export default Home;
