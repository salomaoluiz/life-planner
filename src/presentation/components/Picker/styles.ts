import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        borderBottomWidth: 2,
        borderColor: theme.colors.onBackground,
        borderRadius: theme.sizes.borderRadius.small,
        flexGrow: 1,
        margin: 0,
      },
      itemStyle: {
        fontSize: theme.sizes.fontSizes.small,
      },
      picker: {
        backgroundColor: theme.colors.background,
        borderWidth: 0,
        color: theme.colors.onBackground,
        height: 50,
      },
    }),
    theme,
  };
}

export default getStyles;
