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
        ? theme.colors.textSecondary
        : theme.colors.surface,
      thumbColorTrue: theme.colors.onAccent,
      trackColorFalse: theme.dark ? theme.colors.border : theme.colors.border,
      trackColorTrue: theme.colors.accent,
    },
    theme,
  };
}

export default getStyles;
