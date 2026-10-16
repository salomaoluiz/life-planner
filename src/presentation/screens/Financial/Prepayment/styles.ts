import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      form: { gap: theme.sizes.spacing.md },
      summary: { gap: theme.sizes.spacing.xs },
      switchRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    }),
  };
}

export default useStyles;
