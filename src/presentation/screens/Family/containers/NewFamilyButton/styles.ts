import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      marginTop: theme.sizes.spacing.md,
    },
  });
}

export default getStyles;
