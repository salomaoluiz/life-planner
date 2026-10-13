import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      header: { gap: theme.sizes.spacing.md },
      noResults: {
        alignItems: "center",
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.xl,
      },
    }),
    theme,
  };
}

export default useStyles;
