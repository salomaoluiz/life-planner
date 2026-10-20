import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      body: { gap: theme.sizes.spacing.sm },
      header: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
        minHeight: 56,
      },
      headerText: { flex: 1 },
      inlineAction: { flex: 1 },
      inlineActions: {
        flexDirection: "row",
        gap: theme.sizes.spacing.sm,
      },
    }),
    theme,
  };
}

export default useStyles;
