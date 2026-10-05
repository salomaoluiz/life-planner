import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@presentation/theme";

function useStyles() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return {
    styles: StyleSheet.create({
      bar: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        flexDirection: "row",
        height: theme.sizes.size.tabBarHeight + insets.bottom,
        paddingBottom: insets.bottom,
      },
      column: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        minHeight: theme.sizes.size.touchTarget,
      },
    }),
    theme,
  };
}

export default useStyles;
