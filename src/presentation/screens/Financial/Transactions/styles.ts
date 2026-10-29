import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const FAB_SIZE = 56; // same as the Fab component

function useStyles(wide = false) {
  const { theme } = useTheme();
  // Spec 050: 16 px from the edges on mobile, 32 px on web/tablet; the list reserves FAB + 2 margins at its end.
  const fabMargin = wide ? theme.sizes.spacing.xxl : theme.sizes.spacing.md;

  return {
    styles: StyleSheet.create({
      balance: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
      balanceColumn: { alignItems: "flex-end", gap: theme.sizes.spacing.xxs },
      balanceLabel: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
      fab: { bottom: fabMargin, position: "absolute", right: fabMargin },
      listContent: { paddingBottom: FAB_SIZE + 2 * fabMargin },
      monthSwitcher: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      net: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xxs,
      },
      periodChip: { alignSelf: "flex-start" },
      root: { flex: 1 },
      toolbar: {
        gap: theme.sizes.spacing.lg,
        paddingBottom: theme.sizes.spacing.lg,
      },
      tooltip: { gap: theme.sizes.spacing.xxs },
    }),
  };
}

export default useStyles;
