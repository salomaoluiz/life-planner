import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      center: { alignItems: "center", paddingVertical: theme.sizes.spacing.lg },
      dayHeader: {
        paddingBottom: theme.sizes.spacing.xs,
        paddingTop: theme.sizes.spacing.lg,
      },
      diff: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.xxs,
      },
      meta: { gap: theme.sizes.spacing.xxs },
      root: { flex: 1 },
      toolbar: {
        gap: theme.sizes.spacing.sm,
        paddingBottom: theme.sizes.spacing.sm,
      },
      trailing: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xs,
      },
    }),
  };
}

export default useStyles;
