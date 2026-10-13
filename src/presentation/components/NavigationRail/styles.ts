import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const RAIL_WIDTH = 240;

function useStyles() {
  const { theme } = useTheme();
  const { borderRadius, size, spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      header: { gap: spacing.md },
      rail: {
        backgroundColor: theme.colors.surface,
        borderRightColor: theme.colors.border,
        borderRightWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        width: RAIL_WIDTH,
      },
      row: {
        alignItems: "center",
        borderRadius: borderRadius.md,
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: size.touchTarget,
        paddingHorizontal: spacing.sm,
      },
      rowActive: { backgroundColor: theme.colors.accentSoft },
      spacer: { flex: 1 },
    }),
    theme,
  };
}

export default useStyles;
