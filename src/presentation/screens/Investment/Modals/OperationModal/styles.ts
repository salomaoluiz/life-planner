import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      feeCell: { flex: 1, minWidth: 0 },
      feeKind: { flex: 1.3, minWidth: 0 },
      feeRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: spacing.xs,
      },
      feeStack: { gap: spacing.xs },
      field: { gap: spacing.xs },
      form: { gap: spacing.md },
      pair: { flexDirection: "row", gap: spacing.sm },
      pairCell: { flex: 1, gap: spacing.xs },
      summary: { gap: spacing.xs },
      summaryLine: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    }),
    theme,
  };
}

export default useStyles;
