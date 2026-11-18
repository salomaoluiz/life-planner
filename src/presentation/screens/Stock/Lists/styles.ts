import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      archivedRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      card: { gap: theme.sizes.spacing.md },
      cardHeader: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        justifyContent: "space-between",
      },
      cardMeta: { flexDirection: "row", gap: theme.sizes.spacing.md },
      cardTitle: { flex: 1, gap: theme.sizes.spacing.xxs },
      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.md,
      },
      gridItem: { flexBasis: 280, flexGrow: 1, flexShrink: 1, minWidth: 240 },
      header: { gap: theme.sizes.spacing.md },
      screen: { gap: theme.sizes.spacing.lg },
    }),
    theme,
  };
}

export default useStyles;
