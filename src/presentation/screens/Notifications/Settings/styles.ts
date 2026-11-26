import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      column: { flex: 1, gap: theme.sizes.spacing.lg, minWidth: 300 },
      columns: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.lg,
      },
      deviceActions: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
      deviceRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        justifyContent: "space-between",
      },
      deviceText: { flex: 1, gap: theme.sizes.spacing.xxs },
      leadRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        justifyContent: "space-between",
      },
      section: { gap: theme.sizes.spacing.sm },
    }),
    theme,
  };
}

export default useStyles;
