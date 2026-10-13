import { SelectField } from "@components";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

function isThemeMode(value: string): value is ThemeMode {
  return Object.values<string>(ThemeMode).includes(value);
}

function Theme() {
  const { setThemeMode, themeMode } = useTheme();
  const { t } = useTranslation();

  function onChange(value: string) {
    if (isThemeMode(value)) {
      setThemeMode(value);
    }
  }

  return (
    <SelectField
      closeLabel={t("common.actions.close")}
      label={t("configurations.configs.theme.title")}
      onChange={onChange}
      options={[
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
      sheetTitle={t("configurations.configs.theme.title")}
      testID="theme-picker"
      value={themeMode}
    />
  );
}

export default Theme;
