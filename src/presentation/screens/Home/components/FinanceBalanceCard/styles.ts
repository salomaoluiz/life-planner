import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      breakdown: {
        alignItems: "center",
        columnGap: theme.sizes.spacing.xs,
        flexDirection: "row",
        flexWrap: "wrap",
      },
      header: { gap: theme.sizes.spacing.xs },
      metric: { flex: 1 },
      metrics: { flexDirection: "row", gap: theme.sizes.spacing.sm },
      root: { gap: theme.sizes.spacing.lg },
    }),
    theme,
  };
}

export default useStyles;
