import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      blurView: {
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.sizes.borderRadius.large,
        borderWidth: 1,
        overflow: "hidden",
      },
      content: {
        padding: theme.sizes.spacing.medium,
      },
      wrapper: {
        borderRadius: theme.sizes.borderRadius.large,
        marginBottom: theme.sizes.spacing.small,
        shadowColor: theme.colors.shadow,
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: theme.dark ? 0.3 : 0.08,
        shadowRadius: theme.sizes.spacing.xsmall,
      },
    }),
    theme,
  };
}

export default getStyles;
