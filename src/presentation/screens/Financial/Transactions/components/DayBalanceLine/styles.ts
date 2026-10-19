import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      root: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        minHeight: 40,
        paddingLeft: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.xs,
      },
      title: { flex: 1, minWidth: 0 },
    }),
  };
}

export default useStyles;
