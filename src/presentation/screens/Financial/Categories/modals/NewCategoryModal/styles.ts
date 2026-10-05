import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      form: { gap: theme.sizes.spacing.md },
      helper: { gap: theme.sizes.spacing.xs },
      preview: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.md,
      },
    }),
  };
}

export default useStyles;
