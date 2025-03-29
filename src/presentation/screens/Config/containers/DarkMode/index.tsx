import { Spacer, Switch, Text } from "@components";
import { useTheme } from "@presentation/theme";

function DarkMode() {
  const { isDark, setIsDark } = useTheme();
  return (
    <>
      <Text.Title value={"Dark Mode"} />
      <Spacer direction={"horizontal"} horizontalLine size={"flex"} />
      <Switch initialStatus={isDark} onToggle={setIsDark} />
    </>
  );
}

export default DarkMode;
