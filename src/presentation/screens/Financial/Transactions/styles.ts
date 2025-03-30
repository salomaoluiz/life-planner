import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { getScreenSizes, getWindowsSizes } from "@utils/device";
import { isWeb } from "@utils/platform";

function getStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: theme.colors.background,
      flex: 1,
      paddingTop: theme.sizes.spacing.xxlarge,
    },
    fabContainer: {
      alignItems: "flex-end",
      bottom: theme.sizes.spacing.large,
      flexDirection: "row",
      justifyContent: "flex-end",
      position: "absolute",
      right: theme.sizes.spacing.large,
    },
    listContainer: {
      alignSelf: "stretch",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.sizes.borderRadius.large,
      flexDirection: "row",
      marginHorizontal: isWeb()
        ? getScreenSizes().width / 10
        : theme.sizes.spacing.large,
      minWidth: isWeb() ? getScreenSizes().width / 3 : getWindowsSizes().width,
    },
    listContentContainer: {
      flex: 1,
      paddingHorizontal: theme.sizes.spacing.large,
      paddingVertical: theme.sizes.spacing.large,
    },
  });
}

export default getStyles;
