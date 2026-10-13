import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.sizes.borderRadius.lg,
      borderWidth: 1,
      flex: 1,
      marginBottom: theme.sizes.spacing.sm,
      overflow: "hidden",
      paddingHorizontal: theme.sizes.spacing.sm,
      paddingVertical: 0,
    },
    contentContainer: {
      backgroundColor: theme.dark
        ? theme.colors.surfaceRaised
        : theme.colors.surfaceRaised,
      borderBottomEndRadius: theme.sizes.borderRadius.lg,
      borderBottomStartRadius: theme.sizes.borderRadius.lg,
      marginHorizontal: theme.sizes.spacing.sm,
      padding: theme.sizes.spacing.sm,
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
