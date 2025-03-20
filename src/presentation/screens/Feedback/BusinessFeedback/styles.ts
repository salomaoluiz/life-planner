import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      buttonsContainer: {},
      closeContainer: {
        position: "absolute",
        right: theme.sizes.spacing.small,
        top: theme.sizes.spacing.small,
      },
      container: {
        backgroundColor: theme.colors.background,
        flex: 1,
        justifyContent: "flex-end",
        padding: theme.sizes.spacing.small,
      },
      headerContainer: {
        marginVertical: theme.sizes.spacing.medium,
      },
      iconContainer: {},
    }),
    theme,
  };
}

export default getStyles;
