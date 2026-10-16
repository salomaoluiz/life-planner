import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      carousel: { gap: theme.sizes.spacing.sm },
      headerActions: { flexDirection: "row" },
      metrics: { flexDirection: "row", gap: theme.sizes.spacing.sm },
      root: { flex: 1 },
      selectedHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: theme.sizes.spacing.sm,
      },
      toolbar: {
        gap: theme.sizes.spacing.lg,
        paddingBottom: theme.sizes.spacing.lg,
      },
      totalBody: { gap: theme.sizes.spacing.md },
      totalColumn: { flex: 1 },
      totalRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
    }),
  };
}

export default useStyles;
