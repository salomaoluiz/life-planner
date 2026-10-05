import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      buttonsContainer: {
        flexDirection: "row",
      },
      closeContainer: {
        position: "absolute",
        right: theme.sizes.spacing.sm,
        top: theme.sizes.spacing.sm,
      },
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        justifyContent: "flex-end",
        padding: theme.sizes.spacing.sm,
      },
      headerContainer: {
        marginVertical: theme.sizes.spacing.md,
      },
      iconContainer: {},
    }),
    theme,
  };
}

export default getStyles;
