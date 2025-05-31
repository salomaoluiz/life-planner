import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "space-between",
      },
      iconContainer: {
        marginRight: theme.sizes.spacing.medium,
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
      },
    }),
    theme,
  };
}

export default getStyles;
