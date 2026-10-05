import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: "center",
      padding: theme.sizes.spacing.md,
    },
    form: {
      alignSelf: "stretch",
      maxWidth: 480,
      width: "100%",
    },
  });
}

export default getStyles;
