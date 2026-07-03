import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.glassBackground,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.sizes.borderRadius.large,
        borderWidth: 1,
        flexGrow: 1,
        margin: 0,
        overflow: "hidden",
      },
      itemStyle: {
        fontSize: theme.sizes.fontSizes.small,
      },
      picker: {
        backgroundColor: "transparent",
        borderWidth: 0,
        color: theme.colors.onBackground,
        height: 50,
      },
    }),
    theme,
  };
}

export default getStyles;
