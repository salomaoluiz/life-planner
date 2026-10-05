import { Picker, Spacer, Text } from "@components";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

function Theme() {
  const { setThemeMode, themeMode } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Text.Title value={t("configurations.configs.theme.title")} />
      <Spacer direction={"horizontal"} horizontalLine size={"flex"} />
      <Picker
        items={[
          {
            label: t("configurations.configs.theme.system"),
            value: ThemeMode.SYSTEM,
          },
          {
            label: t("configurations.configs.theme.light"),
            value: ThemeMode.LIGHT,
          },
          {
            label: t("configurations.configs.theme.dark"),
            value: ThemeMode.DARK,
          },
        ]}
        onValueChange={setThemeMode}
        selectedValue={themeMode}
        testID={"theme-picker"}
      />
    </>
  );
}

export default Theme;
