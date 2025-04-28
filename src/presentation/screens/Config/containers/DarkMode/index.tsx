import { Spacer, Switch, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

function DarkMode() {
  const { isDark, setIsDark } = useTheme();
  const { t } = useTranslation();
  return (
    <>
      <Text.Title value={t("configurations.configs.darkMode.title")} />
      <Spacer direction={"horizontal"} horizontalLine size={"flex"} />
      <Switch initialStatus={isDark} onToggle={setIsDark} />
    </>
  );
}

export default DarkMode;
