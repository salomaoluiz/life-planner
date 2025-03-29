import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { isWeb } from "@utils/platform";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    background: {
      alignItems: "center",
      backgroundColor: theme.colors.background,
      flex: 1,
      padding: theme.sizes.spacing.small,
    },
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.sizes.borderRadius.large,
      flex: 1,
      justifyContent: "space-between",
      marginHorizontal: theme.sizes.spacing.xxxlarge,
      marginTop: theme.sizes.spacing.xxlarge,
      padding: theme.sizes.spacing.large,
      width: isWeb() ? "50%" : "100%",
    },
    list: {
      marginBottom: theme.sizes.spacing.xlarge,
    },
    listItem: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    logoutContainer: {
      bottom: 0,
      flexDirection: "row",
    },
    titleContainer: {},
  });
}

export default getStyles;
