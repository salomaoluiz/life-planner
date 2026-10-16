import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xs,
      },
      header: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        minHeight: 56,
        paddingVertical: theme.sizes.spacing.sm,
      },
      headerText: { flex: 1, gap: theme.sizes.spacing.xxs, minWidth: 0 },
      purchases: { paddingBottom: theme.sizes.spacing.xs },
    }),
  };
}

export default useStyles;
