import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.sizes.borderRadius.medium,
      flex: 1,
      paddingHorizontal: theme.sizes.spacing.small,
      paddingVertical: 0,
    },
    contentContainer: {
      backgroundColor: theme.colors.backdrop,
      borderBottomEndRadius: theme.sizes.borderRadius.large,
      borderBottomStartRadius: theme.sizes.borderRadius.large,
      marginHorizontal: theme.sizes.spacing.small,
      padding: theme.sizes.spacing.small,
    },
    headerContainer: {
      flex: 1,
      height: "100%",
      width: "100%",
    },
    itemContainer: {},
    leftContainer: {
      alignItems: "center",
      alignSelf: "center",
      height: "100%",
      justifyContent: "center",
    },
    rightContainer: {
      alignItems: "center",
      alignSelf: "center",
      height: "100%",
      justifyContent: "center",
    },
  });
}

export default getStyles;
