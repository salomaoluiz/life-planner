import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      column: { gap: theme.sizes.spacing.md },
    }),
    theme,
  };
}

export default useStyles;
