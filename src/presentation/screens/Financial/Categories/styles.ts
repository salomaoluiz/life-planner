import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { getScreenSizes, getWindowsSizes } from "@utils/device";
import { isWeb } from "@utils/platform";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        alignItems: "center",
        backgroundColor: theme.colors.background,
        flex: 1,
        paddingBottom: isWeb() ? theme.sizes.spacing.xxxl : undefined,
        paddingTop: isWeb() ? theme.sizes.spacing.xxxl : undefined,
      },
      filterContainer: {
        alignSelf: "stretch",
        marginBottom: theme.sizes.spacing.sm,
        marginHorizontal: isWeb()
          ? getScreenSizes().width * 0.05
          : theme.sizes.spacing.md,
        marginTop: theme.sizes.spacing.md,
      },
      listContainer: {
        alignSelf: "stretch",
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: isWeb() ? theme.sizes.borderRadius.lg : undefined,
        flexDirection: "row",
        marginHorizontal: isWeb() ? getScreenSizes().width * 0.05 : undefined,
        minWidth: isWeb()
          ? getScreenSizes().width / 2
          : getWindowsSizes().width,
      },
      listContentContainer: {
        flex: 1,
        paddingHorizontal: isWeb() ? theme.sizes.spacing.xl : undefined,
        paddingVertical: isWeb() ? theme.sizes.spacing.xl : undefined,
      },
      scrollView: {
        flex: 1,
      },
    }),
    theme,
  };
}

export default getStyles;
