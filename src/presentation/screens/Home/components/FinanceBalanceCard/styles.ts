import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      metric: { flex: 1 },
      metrics: { flexDirection: "row", gap: theme.sizes.spacing.sm },
    }),
    theme,
  };
}

export default useStyles;
