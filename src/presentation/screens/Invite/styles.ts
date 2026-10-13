import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actions: { alignSelf: "stretch", gap: theme.sizes.spacing.sm },
      column: {
        alignItems: "center",
        alignSelf: "center",
        gap: theme.sizes.spacing.sm,
        maxWidth: 480,
        paddingVertical: theme.sizes.spacing.xl,
        width: "100%",
      },
    }),
    theme,
  };
}

export default useStyles;
