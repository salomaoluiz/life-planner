import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: { backgroundColor: theme.colors.background, flex: 1 },
    fabContainer: {
      alignItems: "flex-end",
      bottom: theme.sizes.spacing.large,
      flexDirection: "row",
      justifyContent: "flex-end",
      position: "absolute",
      right: theme.sizes.spacing.large,
    },
  });
}

export default getStyles;
