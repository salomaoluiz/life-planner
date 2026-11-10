import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      balanceColumn: { alignItems: "flex-end" },
      root: { flex: 1 },
      subtotals: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
        justifyContent: "flex-end",
      },
      toolbar: {
        gap: theme.sizes.spacing.lg,
        paddingBottom: theme.sizes.spacing.lg,
      },
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
