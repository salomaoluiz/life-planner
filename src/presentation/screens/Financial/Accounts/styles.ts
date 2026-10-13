import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      root: { flex: 1 },
      toolbar: {
        gap: theme.sizes.spacing.sm,
        paddingBottom: theme.sizes.spacing.sm,
      },
      totalColumn: { flex: 1, gap: theme.sizes.spacing.xs },
      totalRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
    }),
  };
}

export default useStyles;
