import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      buttonContainer: {
        flexDirection: "row",
        width: "70%",
      },
      container: {
        alignItems: "center",
        backgroundColor: theme.colors.background,
        flex: 1,
        padding: theme.sizes.spacing.xxxlarge,
      },
    }),
    theme,
  };
}

export default getStyles;
