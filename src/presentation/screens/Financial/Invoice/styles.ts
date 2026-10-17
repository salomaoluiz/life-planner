import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: { gap: theme.sizes.spacing.sm },
      body: { gap: theme.sizes.spacing.lg },
      header: { gap: theme.sizes.spacing.xs },
      headerRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      trailing: {
        alignItems: "flex-end",
        gap: theme.sizes.spacing.xxs,
      },
    }),
  };
}

export default useStyles;
