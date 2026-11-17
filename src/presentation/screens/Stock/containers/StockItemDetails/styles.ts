import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
      },
      content: { gap: theme.sizes.spacing.md },
      historyInfo: { flex: 1, gap: theme.sizes.spacing.xxs },
      historyRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
      },
      inline: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xs,
      },
      lotInfo: { flex: 1, gap: theme.sizes.spacing.xxs },
      lotRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        justifyContent: "space-between",
      },
      row: { gap: theme.sizes.spacing.xxs },
      tiles: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
      },
    }),
    theme,
  };
}

export default useStyles;
