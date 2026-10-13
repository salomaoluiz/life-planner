import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      clearIconContainer: {
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: theme.sizes.spacing.xs,
      },
      dateText: {
        color: theme.colors.textPrimary,
      },
      frame: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.sizes.borderRadius.md,
        borderWidth: 1,
        flexDirection: "row",
        height: theme.sizes.spacing.xxxl,
        justifyContent: "space-between",
        overflow: "hidden",
        paddingLeft: theme.sizes.spacing.md,
        width: "100%",
      },
      innerContainer: {
        flex: 1,
        justifyContent: "center",
      },
      label: {
        color: theme.colors.textPrimary,
        marginBottom: theme.sizes.spacing.xs,
      },
      mainWrapper: {
        marginBottom: theme.sizes.spacing.md,
        width: "100%",
      },
      placeholderText: {
        color: theme.colors.textSecondary,
      },
      pressable: {
        width: "100%",
      },
    }),
    theme,
  };
}

export default getStyles;
