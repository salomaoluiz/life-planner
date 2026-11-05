import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.sizes.spacing.sm,
      },
      form: { gap: theme.sizes.spacing.lg },
    }),
  };
}

export default useStyles;
