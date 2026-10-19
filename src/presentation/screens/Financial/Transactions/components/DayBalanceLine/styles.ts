import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const { spacing } = theme.sizes;

  return {
    styles: StyleSheet.create({
      row: {
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 44,
      },
      title: { flex: 1, gap: spacing.xxs, minWidth: 0 },
    }),
  };
}

export default useStyles;
