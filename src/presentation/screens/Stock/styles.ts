import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xxs,
        justifyContent: "flex-end",
      },
      catalogChips: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
      },
      header: { gap: theme.sizes.spacing.md },
      noResults: {
        alignItems: "center",
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.xl,
      },
      rowTrailing: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xxs,
      },
    }),
    theme,
  };
}

export default useStyles;
