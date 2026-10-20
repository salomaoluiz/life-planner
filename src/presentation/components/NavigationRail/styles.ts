import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

const RAIL_WIDTH = 240;
const ROW_ICON_SIZE = 22;
const CHILD_MIN_HEIGHT = 40;

function useStyles() {
  const { theme } = useTheme();
  const { borderRadius, size, spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      chevron: { marginLeft: "auto" },
      child: {
        alignItems: "center",
        borderRadius: borderRadius.md,
        flexDirection: "row",
        minHeight: CHILD_MIN_HEIGHT,
        // aligned with the parent's label: row padding + icon + gap
        paddingLeft: spacing.sm + ROW_ICON_SIZE + spacing.sm,
        paddingRight: spacing.sm,
      },
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
