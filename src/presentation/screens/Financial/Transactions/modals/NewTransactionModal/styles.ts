import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      field: { flex: 1 },
      form: { gap: theme.sizes.spacing.md },
      hint: { gap: theme.sizes.spacing.xs },
      row: { flexDirection: "row", gap: theme.sizes.spacing.sm },
      switchRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
    }),
  };
}

export default useStyles;
