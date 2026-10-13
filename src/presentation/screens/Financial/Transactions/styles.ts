import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      filters: { paddingBottom: theme.sizes.spacing.xs },
      monthSwitcher: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      root: { flex: 1 },
      summaryRow: { flexDirection: "row", gap: theme.sizes.spacing.sm },
      toolbar: {
        gap: theme.sizes.spacing.sm,
        paddingBottom: theme.sizes.spacing.sm,
      },
    }),
  };
}

export default useStyles;
