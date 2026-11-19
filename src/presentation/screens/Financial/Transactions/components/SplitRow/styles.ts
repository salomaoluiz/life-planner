import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        justifyContent: "flex-end",
        paddingTop: spacing.sm,
      },
      amount: { alignItems: "flex-end", gap: spacing.xxs },
      badges: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      header: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 56,
        paddingVertical: spacing.sm,
      },
      headerText: { flex: 1, gap: spacing.xxs, minWidth: 0 },
      part: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 44,
        paddingVertical: spacing.xs,
      },
      partAmount: { alignItems: "flex-end" },
      parts: { paddingLeft: spacing.xl },
      partText: { flex: 1, gap: spacing.xxs, minWidth: 0 },
      tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    }),
  };
}

export default useStyles;
