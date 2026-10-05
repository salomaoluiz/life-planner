import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

export function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      actionColumn: {
        alignItems: "center",
        flexDirection: "row",
      },
      archivedContainer: {
        backgroundColor: theme.colors.surfaceRaised,
        opacity: 0.6,
      },
      badge: {
        color: theme.colors.expense,
        fontSize: 10,
        fontWeight: "bold",
      },
      balanceColumn: {
        alignItems: "flex-end",
        marginRight: theme.sizes.spacing.medium,
      },
      container: {
        alignItems: "center",
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingHorizontal: theme.sizes.spacing.medium,
        paddingVertical: theme.sizes.spacing.small,
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
