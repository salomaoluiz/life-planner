import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
      },
    }),
    switchColors: {
      thumbColorFalse: theme.dark
        ? theme.colors.onSurfaceVariant
        : theme.colors.surface,
      thumbColorTrue: theme.colors.onPrimary,
      trackColorFalse: theme.dark
        ? theme.colors.outlineVariant
        : theme.colors.outline,
      trackColorTrue: theme.colors.primary,
    },
    theme,
  };
}

export default getStyles;
