import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

interface StyleProps {
  disabled: boolean;
  isFocused: boolean;
}

function getStyles({ disabled, isFocused }: StyleProps) {
  const { theme } = useTheme();
  return {
    styles: StyleSheet.create({
      blurView: {
        backgroundColor: isFocused
          ? theme.colors.surface
          : theme.colors.surface,
        borderColor: isFocused ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.sizes.borderRadius.lg,
        borderWidth: 1,
        opacity: disabled ? 0.5 : 1,
        overflow: "hidden",
      },
      container: {
        marginBottom: theme.sizes.spacing.md,
        width: "100%",
      },
      labelContainer: {
        color: theme.colors.textPrimary,
        marginBottom: theme.sizes.spacing.xs,
      },
      textInput: {
        backgroundColor: "transparent",
        color: theme.colors.textPrimary,
        minHeight: theme.sizes.spacing.xxxl,
        width: "100%",
      },
    }),
    theme,
  };
}

export default getStyles;
