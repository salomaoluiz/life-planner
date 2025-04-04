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
      paddingTop: isWeb() ? theme.sizes.spacing.xxlarge : undefined,
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
      borderRadius: isWeb() ? theme.sizes.borderRadius.large : undefined,
      flexDirection: "row",
      marginHorizontal: isWeb() ? getScreenSizes().width * 0.05 : undefined,
      minWidth: isWeb() ? getScreenSizes().width / 3 : getWindowsSizes().width,
    },
    listContentContainer: {
      flex: 1,
      paddingHorizontal: isWeb() ? theme.sizes.spacing.large : undefined,
      paddingVertical: isWeb() ? theme.sizes.spacing.large : undefined,
    },
  });
}

export default getStyles;
