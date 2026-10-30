import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { borderRadius, spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      pill: {
        alignSelf: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
        justifyContent: "center",
      },
    }),
  };
}

export default useStyles;
