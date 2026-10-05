import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        marginVertical: theme.sizes.spacing.xxxl,
      },
    }),
    theme,
  };
}

export default getStyles;
