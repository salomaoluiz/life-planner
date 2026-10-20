import { StyleSheet } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

function useStyles(
  columns: 1 | 2,
  leftWidth?: number,
  compactGap: "lg" | "md" = "md",
) {
  const { colors, spacing } = useKitTheme();
  const wide = columns === 2;

  return StyleSheet.create({
    left: wide
      ? {
          gap: spacing.lg,
          ...(leftWidth ? { width: leftWidth } : { flex: 1, minWidth: 0 }),
        }
      : { gap: spacing[compactGap] },
    right: wide
      ? {
          borderLeftColor: colors.border,
          borderLeftWidth: 1,
          flex: 1,
          gap: spacing.lg,
          minWidth: 0,
          paddingLeft: spacing.xxl,
        }
      : { gap: spacing[compactGap] },
    root: wide
      ? { columnGap: spacing.xxl, flexDirection: "row" }
      : { gap: spacing[compactGap] },
  });
}

export default useStyles;
