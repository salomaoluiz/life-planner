import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

export function getStyles(depthLevel: number = 0) {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        alignItems: "center",
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingHorizontal: theme.sizes.spacing.medium,
        paddingLeft: theme.sizes.spacing.medium + depthLevel * 20,
        paddingVertical: theme.sizes.spacing.small,
      },
      deleteColumn: {
        justifyContent: "center",
      },
      detailsColumn: {
        flex: 1,
        justifyContent: "center",
      },
      iconColumn: {
        marginRight: theme.sizes.spacing.medium,
      },
    }),
    theme,
  };
}
