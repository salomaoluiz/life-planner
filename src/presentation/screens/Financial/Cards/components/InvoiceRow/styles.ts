import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      badges: { flexDirection: "row", gap: theme.sizes.spacing.xs },
      body: { gap: theme.sizes.spacing.xs },
      header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      row: { paddingBottom: theme.sizes.spacing.sm },
      title: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
    }),
  };
}

export default useStyles;
