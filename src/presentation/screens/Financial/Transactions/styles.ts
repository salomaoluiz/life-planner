import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

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
