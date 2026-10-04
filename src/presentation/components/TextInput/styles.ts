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
          ? theme.colors.glassBackgroundFocused
          : theme.colors.glassBackground,
        borderColor: isFocused
          ? theme.colors.glassBorderFocused
          : theme.colors.glassBorder,
        borderRadius: theme.sizes.borderRadius.large,
        borderWidth: 1,
        opacity: disabled ? 0.5 : 1,
        overflow: "hidden",
      },
      container: {
        marginBottom: theme.sizes.spacing.medium,
        width: "100%",
      },
      labelContainer: {
        color: theme.colors.onBackground,
        marginBottom: theme.sizes.spacing.xsmall,
      },
      textInput: {
        backgroundColor: "transparent",
        color: theme.colors.onBackground,
        minHeight: theme.sizes.spacing.xxlarge,
        width: "100%",
      },
    }),
    theme,
  };
}

export default getStyles;
