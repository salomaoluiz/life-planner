import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      groupHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: theme.sizes.spacing.sm,
        paddingTop: theme.sizes.spacing.sm,
      },
      trailing: { alignItems: "flex-end", gap: theme.sizes.spacing.xs },
    }),
    theme,
  };
}

export default useStyles;
