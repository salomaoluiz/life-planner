import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      paddingVertical: theme.sizes.spacing.xsmall,
    },
    leftContainer: {
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      paddingRight: theme.sizes.spacing.small,
    },
    rightContainer: {
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      paddingLeft: theme.sizes.spacing.small,
    },
  });
}

export default getStyles;
