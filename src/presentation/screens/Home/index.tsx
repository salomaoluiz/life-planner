import { Button, Text, View } from "react-native";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";

function Home() {
  const { t } = useTranslation();
  const { availableLanguages, changeLocale, getLocale } =
    useTranslationLocale();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{t("home.editLabel")}</Text>
      {availableLanguages.map((location) => (
        <Button
          title={location}
          onPress={() => {
            changeLocale(location);
          }}
        />
      ))}
      <Text>{JSON.stringify(getLocale()).replaceAll(",", "\n,")}</Text>
    </View>
  );
}

export default Home;
