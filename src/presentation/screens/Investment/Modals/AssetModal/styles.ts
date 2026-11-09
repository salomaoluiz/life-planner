import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      field: { gap: theme.sizes.spacing.xs },
      form: { gap: theme.sizes.spacing.md },
    }),
  };
}

export default useStyles;
