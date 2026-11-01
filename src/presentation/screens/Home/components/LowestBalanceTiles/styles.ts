import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      detail: { gap: theme.sizes.spacing.xs },
      detailTitle: { paddingBottom: theme.sizes.spacing.xs },
      root: { gap: theme.sizes.spacing.sm },
      tile: { flex: 1, gap: theme.sizes.spacing.xs },
      tileHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      tiles: { flexDirection: "row", gap: theme.sizes.spacing.sm },
      tileText: { flex: 1 },
      total: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: theme.sizes.spacing.xs,
      },
    }),
    theme,
  };
}

export default useStyles;
