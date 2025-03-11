import { useTheme } from "@presentation/theme";
import { StyleSheet } from "react-native";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      marginVertical: theme.sizes.spacing.xxxlarge,
    },
    title: {
      color: theme.colors.onBackground,
    },
  });
}

export default getStyles;
