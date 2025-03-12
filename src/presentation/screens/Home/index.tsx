// TODO: Remove this console log

import { useEffect } from "react";
import { View } from "react-native";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { Button, Switch, Text } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

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

  const { isDark, setIsDark } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Text.Body testID={"edit-label"} value={t("home.editLabel")} />
      {availableLanguages.map((location, index) => (
        <Button.Filled
          key={`button-${index}`}
          label={location}
          onPress={() => {
            changeLocale(location);
          }}
          testID={`button-${index}`}
        />
      ))}
      <Text.Display testID={"display"} value={`isDark: ${isDark}`} />
      <Switch initialStatus={isDark} onToggle={setIsDark} testID={"switch"} />
      <Button.Outlined
        label={"Go To Login"}
        onPress={() => {
          mutate();
        }}
        testID={"go-to-login"}
      />
      <Text.Caption
        testID={"locale"}
        value={JSON.stringify(getLocale()).replaceAll(",", "\n,")}
      />
    </View>
  );
}

export default Home;
