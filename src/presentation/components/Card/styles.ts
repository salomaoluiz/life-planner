import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      blurView: {
        borderColor: theme.colors.border,
        borderRadius: theme.sizes.borderRadius.lg,
        borderWidth: 1,
        overflow: "hidden",
      },
      content: {
        padding: theme.sizes.spacing.md,
      },
      wrapper: {
        borderRadius: theme.sizes.borderRadius.lg,
        marginBottom: theme.sizes.spacing.sm,
        shadowColor: theme.colors.scrim,
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: theme.dark ? 0.3 : 0.08,
        shadowRadius: theme.sizes.spacing.xs,
      },
    }),
    theme,
  };
}

export default getStyles;
