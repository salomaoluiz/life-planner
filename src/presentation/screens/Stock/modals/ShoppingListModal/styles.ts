import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      column: { gap: theme.sizes.spacing.md },
      footerStart: { gap: theme.sizes.spacing.xxs },
    }),
    theme,
  };
}

export default useStyles;
