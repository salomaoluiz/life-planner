import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      block: { gap: spacing.md },
      column: { flex: 1 },
      end: { alignItems: "flex-end" },
      root: { gap: spacing.lg },
      split: {
        alignItems: "stretch",
        flexDirection: "row",
        gap: spacing.lg,
      },
      stack: { gap: spacing.xxs },
    }),
    theme,
  };
}

export default useStyles;
