import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      trailing: {
        alignItems: "center",
        flexDirection: "row",
        gap: theme.sizes.spacing.xs,
      },
    }),
    theme,
  };
}

export default useStyles;
