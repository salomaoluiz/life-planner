import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      form: { gap: theme.sizes.spacing.md },
      helper: { gap: theme.sizes.spacing.xs },
    }),
  };
}

export default useStyles;
