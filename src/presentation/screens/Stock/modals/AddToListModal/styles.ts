import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      column: { gap: theme.sizes.spacing.md },
      stockLine: { flexDirection: "row", gap: theme.sizes.spacing.lg },
    }),
    theme,
  };
}

export default useStyles;
