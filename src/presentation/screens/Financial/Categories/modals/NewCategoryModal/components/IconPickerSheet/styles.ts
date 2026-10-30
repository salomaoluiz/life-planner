import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    cell: (columns: number) => ({
      padding: spacing.xxs,
      width: `${100 / columns}%` as `${number}%`,
    }),
    styles: StyleSheet.create({
      body: { gap: spacing.md },
      grid: { flexDirection: "row", flexWrap: "wrap" },
      group: { gap: spacing.xs },
      samples: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
    }),
  };
}

export default useStyles;
