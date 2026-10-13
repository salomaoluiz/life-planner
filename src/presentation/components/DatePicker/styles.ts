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
      container: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.sizes.borderRadius.lg,
        borderWidth: 1,
        flexDirection: "row",
        height: theme.sizes.spacing.xxxl,
        justifyContent: "space-between",
        overflow: "hidden",
        paddingLeft: theme.sizes.spacing.md,
        width: "100%",
      },
      dateText: {
        color: theme.colors.textPrimary,
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
