import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: { gap: theme.sizes.spacing.sm },
      form: { gap: theme.sizes.spacing.md },
      planHeader: { gap: theme.sizes.spacing.xs },
      planRowTrailing: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xxs,
      },
    }),
  };
}

export default useStyles;
