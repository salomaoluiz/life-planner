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
      content: { gap: theme.sizes.spacing.sm },
    }),
  };
}

export default useStyles;
