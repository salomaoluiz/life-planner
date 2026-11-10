import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      column: { flex: 1 },
      currency: { width: 96 },
      split: {
        alignItems: "stretch",
        flexDirection: "row",
        gap: theme.sizes.spacing.lg,
      },
      stack: { gap: theme.sizes.spacing.lg },
    }),
    theme,
  };
}

export default useStyles;
