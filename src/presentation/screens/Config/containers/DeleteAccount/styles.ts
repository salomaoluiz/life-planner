import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      body: { gap: theme.sizes.spacing.md },
      footer: { gap: theme.sizes.spacing.xs },
    }),
  };
}

export default useStyles;
